import { StorageRepository } from "@/core/port/driven/repository/StorageRepository";

export class LocalStorageRepository implements StorageRepository {
  getKey<TValue>(key: string): TValue | undefined {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as TValue) : undefined;
  }

  setKey<TValue>(key: string, value: TValue): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  deleteKey(key: string): void {
    localStorage.removeItem(key);
  }
}
