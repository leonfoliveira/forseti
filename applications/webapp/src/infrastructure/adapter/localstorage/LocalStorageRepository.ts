import { StorageRepository } from "@/core/port/driven/repository/StorageRepository";

export class LocalStorageRepository implements StorageRepository {
  /**
   * Retrieves a value from localStorage by its key.
   *
   * @param key The key of the item to retrieve.
   * @returns The parsed value or undefined if not found.
   */
  getKey<TValue>(key: string): TValue | undefined {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as TValue) : undefined;
  }

  /**
   * Stores a value in localStorage under the specified key.
   *
   * @param key The key under which to store the value.
   * @param value The value to store.
   */
  setKey<TValue>(key: string, value: TValue): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Deletes a value from localStorage by its key.
   *
   * @param key The key of the item to delete.
   */
  deleteKey(key: string): void {
    localStorage.removeItem(key);
  }
}
