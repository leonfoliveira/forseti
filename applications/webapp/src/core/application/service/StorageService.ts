import { StorageRepository } from "@/core/port/driven/repository/StorageRepository";
import { StorageReader } from "@/core/port/driving/usecase/storage/StorageReader";
import { StorageWritter } from "@/core/port/driving/usecase/storage/StorageWritter";

export class StorageService implements StorageReader, StorageWritter {
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
}
