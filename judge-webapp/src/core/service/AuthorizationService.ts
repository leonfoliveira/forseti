import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { Authorization } from "@/core/domain/model/Authorization";
import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { signOut } from "@/lib/server-action/auth-action";

export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  async getAuthorization(): Promise<Authorization | null> {
    try {
      return await this.authorizationRepository.getAuthorization();
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
}
