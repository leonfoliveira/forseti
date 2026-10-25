import { AuthenticationRepository } from "@/port/output/repository/AuthenticationRepository";
import { AuthenticationWriter } from "@/port/input/usecase/authentication/AuthenticationWriter";
import { AuthenticateRequestDTO } from "@/port/dto/request/authentication/AuthenticateRequestDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";

export class AuthenticationService implements AuthenticationWriter {
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
