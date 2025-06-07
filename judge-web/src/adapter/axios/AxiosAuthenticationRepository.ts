import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { Authorization } from "@/core/domain/model/Authorization";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  async authenticateMember(
    contestId: string,
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<Authorization> {
    const response = await this.axiosClient.post<Authorization>(
      `/v1/auth/contests/${contestId}`,
      { data: requestDTO },
    );
    return response.data;
  }

  async authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<Authorization> {
    const response = await this.axiosClient.post<Authorization>(
      "/v1/auth/root",
      {
        data: requestDTO,
      },
    );
    return response.data;
  }
}
