import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  private basePath = (contestId: string) => `/v1/contests/${contestId}`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<Authorization> {
    const response = await this.axiosClient.post<Authorization>(
      `${this.basePath(contestId)}/sign-in`,
      { data: requestDTO },
    );
    return response.data;
  }
}
