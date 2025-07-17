import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
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

  async get<TBody>(
    path: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this.request(path, {
      method: "GET",
      ...config,
    });
  }

  async post<TBody>(
    path: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this.request(path, {
      method: "POST",
      ...config,
    });
  }

  async put<TBody>(
    path: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    return this.request(path, {
      method: "PUT",
      ...config,
    });
  }

  async delete(path: string, config: AxiosRequestConfig = {}): Promise<void> {
    await this.request(path, {
      method: "DELETE",
      ...config,
    });
  }

  private async request<TBody>(
    path: string,
    config: AxiosRequestConfig = {},
  ): Promise<AxiosResponse<TBody>> {
    try {
      return await axios.request<TBody>({
        ...config,
        url: config.url || `${this.baseUrl}${path}`,
        headers: {
          Authorization: this.getAuthorizationHeader(),
          ...(config.headers || {}),
        },
      });
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
