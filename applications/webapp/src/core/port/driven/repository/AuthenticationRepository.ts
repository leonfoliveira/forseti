import { AuthenticateRequestDTO } from "@/core/port/driven/repository/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/port/driven/repository/dto/response/session/SessionResponseDTO";

export interface AuthenticationRepository {
  authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO>;
}
