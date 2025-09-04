import { StorageRepository } from "@/core/repository/StorageRepository";

export class StorageService {
  constructor(private readonly storageRepository: StorageRepository) {}

  setKey<TValue>(key: string, value: TValue): void {
    this.storageRepository.setKey(key, value);
  }

  getKey<TValue>(key: string): TValue | undefined {
    return this.storageRepository.getKey<TValue>(key);
  }

  deleteKey(key: string): void {
    this.storageRepository.deleteKey(key);
  }

  static THEME_STORAGE_KEY = "theme";
}
