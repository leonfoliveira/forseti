import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthorizationResponseDTO } from "@/core/repository/dto/response/AuthorizationResponseDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
  ) {}

  authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<AuthorizationResponseDTO> {
    return this.authenticationRepository.authenticateRoot(requestDTO);
  }

  authenticateMember(
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<AuthorizationResponseDTO> {
    return this.authenticationRepository.authenticateMember(requestDTO);
  }
}
