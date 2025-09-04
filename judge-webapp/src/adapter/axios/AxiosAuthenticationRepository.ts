import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async getAuthorization(accessToken: string): Promise<Authorization> {
    const response = await this.axiosClient.get<Authorization>("/v1/auth/me", {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });
    return response.data;
  }

  async authenticate(
    requestDTO: AuthenticateRequestDTO,
  ): Promise<Authorization> {
    const response = await this.axiosClient.post<Authorization>(
      `/v1/auth/sign-in`,
      { data: requestDTO },
    );
    return response.data;
  }
}
