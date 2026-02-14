import { AxiosRequestConfig } from "axios";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosServerSideClient extends AxiosClient {
  /**
   * Cookies and headers to be forwarded between client and API when this code runs in server-side.
   */
  static readonly COOKIES_TO_FORWARD_FROM_CLIENT_TO_API = ["session_id"];
  static readonly HEADERS_TO_FORWARD_FROM_CLIENT_TO_API = [
    "x-csrf-token",
    "x-forwarded-for",
    "user-agent",
  ];

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
    await this.forwardCookiesFromClientToApi(requestConfig);
    await this.forwardHeadersFromClientToApi(requestConfig);
  }

  /**
   * Forwards cookies from client to API in server-side environment.
   *
   * @param requestConfig Axios request configuration.
   */
  private async forwardCookiesFromClientToApi(
    requestConfig: AxiosRequestConfig,
  ): Promise<void> {
    const { cookies } = await import("next/headers");
    const cookiesFn = await cookies();

    const cookiesValues =
      AxiosServerSideClient.COOKIES_TO_FORWARD_FROM_CLIENT_TO_API.map(
        (cookieName) => {
          const cookieValue = cookiesFn.get(cookieName)?.value;
          return cookieValue ? `${cookieName}=${cookieValue}` : null;
        },
      ).filter((cookie) => cookie !== null);

    console.debug("Forwarding cookies from client to API:", cookiesValues);

    if (cookiesValues.length > 0) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers["Cookie"] = cookiesValues.join("; ");
    }
  }

  /**
   * Forwards headers from client to API in server-side environment.
   *
   * @param requestConfig Axios request configuration.
   */
  private async forwardHeadersFromClientToApi(
    requestConfig: AxiosRequestConfig,
  ): Promise<void> {
    const { headers } = await import("next/headers");
    const headersFn = await headers();

    const headersToForward =
      AxiosServerSideClient.HEADERS_TO_FORWARD_FROM_CLIENT_TO_API.reduce(
        (acc, headerName) => {
          const headerValue = headersFn.get(headerName);
          if (headerValue) {
            acc[headerName] = headerValue;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

    console.debug("Forwarding headers from client to API:", headersToForward);

    requestConfig.headers = {
      ...(requestConfig.headers || {}),
      ...headersToForward,
    };
  }
}
