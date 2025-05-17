import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { Authorization } from "@/core/domain/model/Authorization";

export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}
  getAccessToken(): string | null {
    return this.authorizationRepository.getAccessToken();
  }

  getAuthorization(): Authorization | null {
    return this.authorizationRepository.getAuthorization();
  }

  deleteAuthorization(): void {
    this.authorizationRepository.deleteAuthorization();
  }
}
