import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { BusinessException } from "@/core/domain/exception/BusinessException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { ServerException } from "@/core/domain/exception/ServerException";

export class AxiosClient {
  constructor(
    private readonly baseUrl: string,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async get<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(path, {
      method: "GET",
      ...config,
    });
  }

  async post<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      ...config,
    });
  }

  async put<T>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      ...config,
    });
  }

  async delete(path: string, config: AxiosRequestConfig = {}): Promise<void> {
    return this.request(path, {
      method: "DELETE",
      ...config,
    });
  }

  private async request<T>(
    path: string,
    config: AxiosRequestConfig = {},
  ): Promise<T> {
    try {
      const response = await axios.request<T>({
        ...config,
        url: config.url || `${this.baseUrl}${path}`,
        headers: {
          Authorization: this.getAuthorizationHeader(),
          ...(config.headers || {}),
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        switch (status) {
          case 400:
            throw new BusinessException(message);
          case 401:
            throw new UnauthorizedException(message);
          case 403:
            throw new ForbiddenException(message);
          case 404:
            throw new NotFoundException(message);
          default:
            throw new ServerException(message);
        }
      }
      throw error;
    }
  }

  private getAuthorizationHeader() {
    const authorization = this.authorizationService.getAuthorization();
    if (authorization != null) {
      return `Bearer ${authorization.accessToken}`;
    }
    return null;
  }
}
