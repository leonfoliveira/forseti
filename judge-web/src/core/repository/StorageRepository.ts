export interface StorageRepository {
  setKey<TValue>(key: string, value: TValue): void;

  getKey<TValue>(key: string): TValue | undefined;

  deleteKey(key: string): void;
}
