import { AxiosRequestConfig, AxiosResponse } from "axios";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosServerSideClient extends AxiosClient {
  /**
   * Cookies and headers to be forwarded between client and API when this code runs in server-side.
   */
  static readonly COOKIES_TO_FORWARD_FROM_CLIENT_TO_API = ["session_id"];
  static readonly COOKIES_TO_FORWARD_FROM_API_TO_CLIENT = [
    "session_id",
    "csrf_token",
  ];
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
   * Modifies the response after it is received.
   *
   * @param response Axios response.
   */
  protected async proxyResponse<TBody>(
    response: AxiosResponse<TBody>,
  ): Promise<void> {
    await this.forwardCookiesFromApiToClient(response);
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
    AxiosServerSideClient.COOKIES_TO_FORWARD_FROM_CLIENT_TO_API.forEach(
      (cookieName) => {
        const cookieValue = cookiesFn.get(cookieName)?.value;
        if (cookieValue) {
          requestConfig.headers = requestConfig.headers || {};
          requestConfig.headers["Cookie"] = [
            ...(requestConfig.headers["Cookie"]
              ? [requestConfig.headers["Cookie"] as string]
              : []),
            `${cookieName}=${cookieValue}`,
          ].join("; ");
        }
      },
    );
  }

  /**
   * Forwards cookies from API response to client in server-side environment.
   *
   * @param response Axios response.
   */
  private async forwardCookiesFromApiToClient(
    response: AxiosResponse,
  ): Promise<void> {
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      const { cookies } = await import("next/headers");

      const cookiesFn = await cookies();
      setCookieHeader.forEach((cookieString: string) => {
        const cookieParts = cookieString.split(";");
        const [nameValuePair] = cookieParts;
        const [cookieName, cookieValue] = nameValuePair.split("=");

        if (
          AxiosServerSideClient.COOKIES_TO_FORWARD_FROM_API_TO_CLIENT.includes(
            cookieName.trim(),
          )
        ) {
          cookiesFn.set(cookieName.trim(), cookieValue.trim());
        }
      });
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
    requestConfig.headers = requestConfig.headers || {};
    AxiosServerSideClient.HEADERS_TO_FORWARD_FROM_CLIENT_TO_API.forEach(
      (headerName) => {
        const headerValue = headersFn.get(headerName);
        if (headerValue) {
          requestConfig.headers![headerName] = headerValue;
        }
      },
    );
  }
}
