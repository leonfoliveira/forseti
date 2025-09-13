import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticateRequestDTO } from "@/core/repository/dto/request/AuthenticateRequestDTO";
import { signOut } from "@/lib/action/auth-action";

export class AuthenticationService {
  constructor(
    private readonly authenticationRepository: AuthenticationRepository,
  ) {}

  async getAuthorization(): Promise<Authorization | null> {
    try {
      return await this.authenticationRepository.getAuthorization();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return null;
      }
      throw error;
    }
  }

  async cleanAuthorization(): Promise<void> {
    await signOut();
  }

  async authenticate(
    contestId: string,
    requestDTO: AuthenticateRequestDTO,
  ): Promise<Authorization> {
    return await this.authenticationRepository.authenticate(
      contestId,
      requestDTO,
    );
  }
}
