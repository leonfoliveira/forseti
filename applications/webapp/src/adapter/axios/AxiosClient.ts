import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";

import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ConflictException } from "@/core/domain/exception/ConflictException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";

export class AxiosClient {
  static readonly COOKIES_TO_FORWARD = new Set(["session_id"]);
  static readonly HEADERS_TO_FORWARD = new Set([
    "x-forwarded-for",
    "user-agent",
    "x-trace-id",
  ]);
  static readonly CSRF_COOKIE_NAME = "csrf_token";
  static readonly CSRF_HEADER_NAME = "x-csrf-token";

  constructor(
    private readonly baseUrl: string,
    private readonly isServer: boolean,
  ) {}

  async get<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this.request(path, {
      method: "GET",
      ...requestConfig,
    });
  }

  async post<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this.request(path, {
      method: "POST",
      ...requestConfig,
    });
  }

  async put<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this.request(path, {
      method: "PUT",
      ...requestConfig,
    });
  }

  async delete(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<void> {
    await this.request(path, {
      method: "DELETE",
      ...requestConfig,
    });
  }

  private async request<TBody>(
    path: string,
    requestConfig: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    try {
      requestConfig.headers = {
        ...requestConfig.headers,
        [AxiosClient.CSRF_HEADER_NAME]: await this.getCsrfToken(),
        "x-trace-id": uuidv4(),
      };

      if (this.isServer) {
        await this.forwardCookies(requestConfig);
        await this.forwardHeaders(requestConfig);
      }

      return await axios.request<TBody>({
        ...requestConfig,
        url: requestConfig.url || `${this.baseUrl}${path}`,
        withCredentials: true,
      });
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

  private async getCsrfToken(): Promise<string | null> {
    if (this.isServer) {
      const { cookies } = await import("next/headers");
      const cookiesFn = await cookies();
      const csrfCookie = cookiesFn.get(AxiosClient.CSRF_COOKIE_NAME);
      return csrfCookie ? csrfCookie.value : null;
    } else {
      const match = document.cookie.match(
        new RegExp(`(^| )${AxiosClient.CSRF_COOKIE_NAME}=([^;]+)`),
      );
      return match ? match[2] : null;
    }
  }

  private async forwardCookies(requestConfig: AxiosRequestConfig) {
    const { cookies } = await import("next/headers");
    const cookiesFn = await cookies();
    const allCookies = cookiesFn.getAll();

    requestConfig.headers = {
      ...requestConfig.headers,
      Cookie: allCookies
        .filter((cookie) =>
          AxiosClient.COOKIES_TO_FORWARD.has(cookie.name.toLowerCase()),
        )
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; "),
    };
  }

  private async forwardHeaders(requestConfig: AxiosRequestConfig) {
    const { headers } = await import("next/headers");
    const clientHeaders = await headers();

    const headersToAdd: Record<string, string> = {};
    clientHeaders.forEach((value, key) => {
      if (AxiosClient.HEADERS_TO_FORWARD.has(key.toLowerCase())) {
        headersToAdd[key.toLowerCase()] = value;
      }
    });

    requestConfig.headers = {
      ...requestConfig.headers,
      ...headersToAdd,
    };
  }
}
