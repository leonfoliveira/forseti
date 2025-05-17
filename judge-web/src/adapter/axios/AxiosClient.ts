import axios from "axios";
import { AuthorizationService } from "@/core/service/AuthorizationService";

export class AxiosClient {
  constructor(
    private readonly baseUrl: string,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async get<T>(path: string): Promise<T> {
    const response = await axios.get<T>(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: this.getAuthorizationHeader(),
      },
    });
    return response.data;
  }

  async post<T>(path: string, requestDTO: object): Promise<T> {
    const response = await axios.post<T>(`${this.baseUrl}${path}`, requestDTO, {
      headers: {
        Authorization: this.getAuthorizationHeader(),
      },
    });
    return response.data;
  }

  async put<T>(path: string, requestDTO: object): Promise<T> {
    const response = await axios.put<T>(`${this.baseUrl}${path}`, requestDTO, {
      headers: {
        Authorization: this.getAuthorizationHeader(),
      },
    });
    return response.data;
  }

  async delete<T>(path: string): Promise<void> {
    await axios.delete<T>(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: this.getAuthorizationHeader(),
      },
    });
  }

  getAuthorizationHeader() {
    const authorization = this.authorizationService.getAuthorization();
    if (authorization != null) {
      return `Bearer ${authorization.accessToken}`;
    }
    return null;
  }
}
