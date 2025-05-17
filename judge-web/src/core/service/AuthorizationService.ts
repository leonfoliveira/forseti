import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { Authorization } from "@/core/domain/model/Authorization";

export class AuthorizationService {
  constructor(
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}
  getAuthorization(): Authorization | null {
    return this.authorizationRepository.getAuthorization();
  }

  deleteAuthorization(): void {
    this.authorizationRepository.deleteAuthorization();
  }
}
