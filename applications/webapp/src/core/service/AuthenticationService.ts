import { AuthenticationRepository } from "@/core/port/driven/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/port/driven/repository/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/port/driven/repository/dto/response/session/SessionResponseDTO";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
  ) {}

  async authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<SessionResponseDTO> {
    return await this.authenticationRepository.authenticate(
      contestId,
      requestDTO,
    );
  }
}
