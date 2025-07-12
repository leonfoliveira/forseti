import { Authorization } from "@/core/domain/model/Authorization";
import { StorageRepository } from "@/core/repository/StorageRepository";

export class AuthorizationService {
  private static STORAGE_KEY = "authorization";

  constructor(private readonly storageRepository: StorageRepository) {}

  setAuthorization(authorization: Authorization): void {
    this.storageRepository.setKey(
      AuthorizationService.STORAGE_KEY,
      authorization,
    );
  }

  getAuthorization(): Authorization | undefined {
    let authorization = this.storageRepository.getKey<Authorization>(
      AuthorizationService.STORAGE_KEY,
    );
    if (
      authorization &&
      new Date(authorization.expiresAt).getTime() <= new Date().getTime()
    ) {
      this.deleteAuthorization();
      authorization = undefined;
    }
    return authorization;
  }

  deleteAuthorization(): void {
    this.storageRepository.deleteKey(AuthorizationService.STORAGE_KEY);
  }
}
