import { AuthenticationRepository } from "@/port/output/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/port/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

export class AxiosAuthenticationRepository implements AuthenticationRepository {
  private basePath = (contestId: string) => `/v1/contests/${contestId}`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO> {
    const response = await this.axiosClient.post<SessionResponseDTO>(
      `${this.basePath(contestId)}:sign-in`,
      { data: requestDTO },
    );
    return response.data;
  }
}
