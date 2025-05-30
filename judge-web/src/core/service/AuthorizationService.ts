import { Authorization } from "@/core/domain/model/Authorization";
import { StorageRepository } from "@/core/repository/StorageRepository";

export class AuthorizationService {
  constructor(private readonly storageRepository: StorageRepository) {}

  static STORAGE_KEY = "authorization";

  setAuthorization(authorization: Authorization): void {
    this.storageRepository.setKey(
      AuthorizationService.STORAGE_KEY,
      authorization,
    );
  }

  getAuthorization(): Authorization | undefined {
    return this.storageRepository.getKey(AuthorizationService.STORAGE_KEY);
  }

  deleteAuthorization(): void {
    this.storageRepository.deleteKey(AuthorizationService.STORAGE_KEY);
  }
}
