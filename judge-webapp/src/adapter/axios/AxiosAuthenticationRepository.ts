import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async getAuthorization(): Promise<Authorization> {
    const response = await this.axiosClient.get<Authorization>("/v1/auth/me");
    return response.data;
  }

  async authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<Authorization> {
    const response = await this.axiosClient.post<Authorization>(
      `/v1/contests/${contestId}/sign-in`,
      { data: requestDTO },
    );
    return response.data;
  }
}
