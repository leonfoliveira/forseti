import { AuthenticationRepository } from "@/port/output/repository/AuthenticationRepository";
import { AuthenticationWritter } from "@/port/input/usecase/authentication/AuthenticationWritter";
import { AuthenticateRequestDTO } from "@/port/dto/request/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

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
