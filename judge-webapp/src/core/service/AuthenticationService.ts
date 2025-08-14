import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository
  ) {}

  async getAuthorization(): Promise<Authorization> {
    return await this.authenticationRepository.getAuthorization();
  }

  async cleanAuthorization(): Promise<void> {
    await this.authenticationRepository.cleanAuthorization();
  }

  async authenticateRoot(
    requestDTO: AuthenticateRootRequestDTO
  ): Promise<Authorization> {
    return await this.authenticationRepository.authenticateRoot(requestDTO);
  }

  async authenticateMember(
    contestId: string,
    requestDTO: AuthenticateMemberRequestDTO
  ): Promise<Authorization> {
    return await this.authenticationRepository.authenticateMember(
      contestId,
      requestDTO
    );
  }
}
