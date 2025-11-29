import { AuthenticationRepository } from "@/core/port/driven/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/port/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

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
