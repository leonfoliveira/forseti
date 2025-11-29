import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AuthenticationRepository } from "@/core/port/driven/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/port/driven/repository/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/port/driven/repository/dto/response/session/SessionResponseDTO";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  private basePath = (contestId: string) => `/v1/contests/${contestId}`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO> {
    const response = await this.axiosClient.post<SessionResponseDTO>(
      `${this.basePath(contestId)}/sign-in`,
      { data: requestDTO },
    );
    return response.data;
  }
}
