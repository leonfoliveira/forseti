import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { Authorization } from "@/core/domain/model/Authorization";
import { AuthorizationService } from "@/core/service/AuthorizationService";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<Authorization> {
    const authorization =
      await this.authenticationRepository.authenticateRoot(requestDTO);
    this.authorizationService.setAuthorization(authorization);
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
    this.authorizationService.setAuthorization(authorization);
    return authorization;
  }
}
