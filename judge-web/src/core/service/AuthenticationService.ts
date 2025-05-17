import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { Authorization } from "@/core/domain/model/Authorization";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  async authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<Authorization> {
    const authorization =
      await this.authenticationRepository.authenticateRoot(requestDTO);
    this.authorizationRepository.setAuthorization(authorization);
    return authorization;
  }

  async authenticateMember(
    contestId: number,
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<Authorization> {
    const authorization =
      await this.authenticationRepository.authenticateMember(
        contestId,
        requestDTO,
      );
    this.authorizationRepository.setAuthorization(authorization);
    return authorization;
  }
}
