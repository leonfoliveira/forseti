import { StorageRepository } from "@/core/port/driven/repository/StorageRepository";
import { StorageReader } from "@/core/port/driving/usecase/storage/StorageReader";
import { StorageWritter } from "@/core/port/driving/usecase/storage/StorageWritter";

export class StorageService implements StorageReader, StorageWritter {
  constructor(private readonly storageRepository: StorageRepository) {}

  /**
   * Store a value associated with a key.
   *
   * @param key The key to associate the value with
   * @param value The value to store
   */
  setKey<TValue>(key: string, value: TValue): void {
    this.storageRepository.setKey(key, value);
  }

  /**
   * Retrieve a value associated with a key.
   *
   * @param key The key whose associated value is to be returned
   * @return The value associated with the key, or undefined if not found
   */
  getKey<TValue>(key: string): TValue | undefined {
    return this.storageRepository.getKey<TValue>(key);
  }

  /**
   * Delete a value associated with a key.
   *
   * @param key The key whose associated value is to be deleted
   */
  deleteKey(key: string): void {
    this.storageRepository.deleteKey(key);
  }
}
