import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthorizationResponseDTO } from "@/core/repository/dto/response/AuthorizationResponseDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  async authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<AuthorizationResponseDTO> {
    const authorization =
      await this.authenticationRepository.authenticateRoot(requestDTO);
    this.authorizationRepository.setAuthorization(authorization.accessToken);
    return authorization;
  }

  async authenticateMember(
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<AuthorizationResponseDTO> {
    const authorization =
      await this.authenticationRepository.authenticateMember(requestDTO);
    this.authorizationRepository.setAuthorization(authorization.accessToken);
    return authorization;
  }
}
