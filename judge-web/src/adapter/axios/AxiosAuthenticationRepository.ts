import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { Authorization } from "@/core/domain/model/Authorization";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  constructor(private readonly axiosClient: AxiosClient) {}

  authenticateMember(
    contestId: number,
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<Authorization> {
    return this.axiosClient.post<Authorization>(
      `/v1/auth/contests/${contestId}`,
      { data: requestDTO },
    );
  }

  authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<Authorization> {
    return this.axiosClient.post<Authorization>("/v1/auth/root", {
      data: requestDTO,
    });
  }
}
