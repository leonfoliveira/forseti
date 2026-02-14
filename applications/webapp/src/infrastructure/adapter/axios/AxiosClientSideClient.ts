import { AxiosRequestConfig } from "axios";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosClientSideClient extends AxiosClient {
  /**
   * Cookie name that holds the CSRF token and header name to be used when sending the CSRF token.
   */
  static readonly CSRF_COOKIE_NAME = "csrf_token";
  static readonly CSRF_HEADER_NAME = "x-csrf-token";

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  /**
   * Modifies the request before it is sent.
   *
   * @param requestConfig Axios request configuration.
   */
  protected async proxyRequest(
    requestConfig: AxiosRequestConfig,
  ): Promise<void> {
    this.injectCsrfToken(requestConfig);
  }

  /**
   * Injects the CSRF token into the request headers.
   * @param requestConfig Axios request configuration.
   */
  private injectCsrfToken(requestConfig: AxiosRequestConfig) {
    const match = document.cookie.match(
      new RegExp(`(^| )${AxiosClientSideClient.CSRF_COOKIE_NAME}=([^;]+)`),
    );
    const token = match ? match[2] : null;
    if (token) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers[AxiosClientSideClient.CSRF_HEADER_NAME] = token;
    }
  }
}
