import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";

export abstract class AxiosClient {
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
      await this.proxyRequest(requestConfig);

      const response = await axios.request<TBody>({
        ...requestConfig,
        url: requestConfig.url || `${this.baseUrl}${path}`,
        withCredentials: true,
      });

      await this.proxyResponse(response);

      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message =
          (error.response?.data && typeof error.response.data === "string"
            ? error.response.data
            : error.response?.data?.message) || error.message;

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
          default:
            throw new ServerException(message);
        }
      }
      throw error;
    }
  }

  /**
   * Modifies the request before it is sent.
   *
   * @param requestConfig Axios request configuration.
   */
  protected abstract proxyRequest(
    requestConfig: AxiosRequestConfig,
  ): Promise<void>;

  /**
   * Modifies the response after it is received.
   *
   * @param response Axios response.
   */
  protected abstract proxyResponse<TBody>(
    response: AxiosResponse<TBody>,
  ): Promise<void>;
}
