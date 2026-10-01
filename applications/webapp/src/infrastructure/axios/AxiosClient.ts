import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import { BusinessException } from "@/domain/exception/BusinessException";
import { ConflictException } from "@/domain/exception/ConflictException";
import { ForbiddenException } from "@/domain/exception/ForbiddenException";
import { NotFoundException } from "@/domain/exception/NotFoundException";
import { ServerException } from "@/domain/exception/ServerException";
import { ServiceUnavailableException } from "@/domain/exception/ServiceUnavailableException";
import { UnauthorizedException } from "@/domain/exception/UnauthorizedException";

export class AxiosClient {
  static readonly CSRF_COOKIE_NAME = "csrf_token";
  static readonly CSRF_HEADER_NAME = "x-csrf-token";

  constructor(private readonly baseUrl: string) {}

  /**
   * Makes an HTTP GET request.
   *
   * @param path resource path
   * @param requestConfig Axios request configuration.
   * @returns Axios response.
   */
  async get<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this._request(path, {
      method: "GET",
      ...requestConfig,
    });
  }

  /**
   * Makes an HTTP POST request.
   *
   * @param path resource path
   * @param requestConfig Axios request configuration.
   * @returns Axios response.
   */
  async post<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this._request(path, {
      method: "POST",
      ...requestConfig,
    });
  }

  /**
   * Makes an HTTP PUT request.
   *
   * @param path resource path
   * @param requestConfig Axios request configuration.
   * @returns Axios response.
   */
  async put<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this._request(path, {
      method: "PUT",
      ...requestConfig,
    });
  }

  /**
   * Makes an HTTP DELETE request.
   *
   * @param path resource path
   * @param requestConfig Axios request configuration.
   */
  async delete(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<void> {
    await this._request(path, {
      method: "DELETE",
      ...requestConfig,
    });
  }

  /**
   * Makes an HTTP request and converts errors to domain exceptions.
   *
   * @param path resource path
   * @param requestConfig Axios request configuration.
   * @returns Axios response.
   */
  private async _request<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    try {
      this.injectCsrfToken(requestConfig);

      console.debug("Making request to:", {
        method: requestConfig.method,
        url: requestConfig.url || `${this.baseUrl}${path}`,
        headers: requestConfig.headers,
        body: requestConfig.data,
      });

      const response = await axios.request<TBody>({
        ...requestConfig,
        url: requestConfig.url || `${this.baseUrl}${path}`,
        withCredentials: true,
      });

      console.debug("Received response:", {
        status: response.status,
        body: response.data,
        headers: response.headers,
      });

      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        const response = error.response;

        if (response) {
          console.debug("Received response:", {
            status: response.status,
            body: response.data,
            headers: response.headers,
          });

          const status = response.status;
          const message =
            (response.data && typeof response.data === "string"
              ? response.data
              : response.data?.message) || error.message;

          switch (status) {
            case 400:
              throw new BusinessException(message);
            case 401:
              throw new UnauthorizedException(message);
            case 403:
              throw new ForbiddenException(message);
            case 404:
              throw new NotFoundException(message);
            case 409:
              throw new ConflictException(message);
            case 503:
              throw new ServiceUnavailableException(message);
            default:
              throw new ServerException(message);
          }
        }
      }
      throw error;
    }
  }

  /**
   * Injects the CSRF token into the request headers.
   * @param requestConfig Axios request configuration.
   */
  private injectCsrfToken(requestConfig: AxiosRequestConfig) {
    const match = document.cookie.match(
      new RegExp(`(^| )${AxiosClient.CSRF_COOKIE_NAME}=([^;]+)`),
    );
    const token = match ? match[2] : null;
    if (token) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers[AxiosClient.CSRF_HEADER_NAME] = token;
    }
  }
}
