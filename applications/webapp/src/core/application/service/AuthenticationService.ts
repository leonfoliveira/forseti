import { AuthenticationRepository } from "@/core/port/driven/repository/AuthenticationRepository";
import { AuthenticationWritter } from "@/core/port/driving/usecase/authentication/AuthenticationWritter";
import { AuthenticateRequestDTO } from "@/core/port/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";

export class AuthenticationService implements AuthenticationWritter {
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
