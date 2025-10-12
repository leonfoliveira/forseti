import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/repository/dto/response/session/SessionResponseDTO";

export interface AuthenticationRepository {
  authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO>;
}
