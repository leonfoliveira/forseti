import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { Authorization } from "@/core/domain/model/Authorization";

export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}
  setAuthorization(authorization: Authorization): void {
    this.authorizationRepository.setAuthorization(authorization);
  }

  getAuthorization(): Authorization | undefined {
    return this.authorizationRepository.getAuthorization();
  }

  deleteAuthorization(): void {
    this.authorizationRepository.deleteAuthorization();
  }
}
