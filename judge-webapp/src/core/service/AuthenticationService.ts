import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { Authorization } from "@/core/domain/model/Authorization";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
  ) {}

  async authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO,
  ): Promise<Authorization> {
    return await this.authenticationRepository.authenticateRoot(requestDTO);
  }

  async authenticateMember(
    contestId: string,
    requestDTO: AuthenticateMemberRequestDTO,
  ): Promise<Authorization> {
    return await this.authenticationRepository.authenticateMember(
      contestId,
      requestDTO,
    );
  }
}
