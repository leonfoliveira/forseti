import axios, { AxiosError } from "axios";
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

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, requestDTO: object): Promise<T> {
    return this.request<T>("POST", path, requestDTO);
  }

  async put<T>(path: string, requestDTO: object): Promise<T> {
    return this.request<T>("PUT", path, requestDTO);
  }

  async delete<T>(path: string): Promise<void> {
    await this.request<T>("DELETE", path);
  }

  private async request<T>(
    method: string,
    path: string,
    data?: object,
  ): Promise<T> {
    try {
      const response = await axios.request<T>({
        url: `${this.baseUrl}${path}`,
        method,
        data,
        headers: {
          Authorization: this.getAuthorizationHeader(),
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
