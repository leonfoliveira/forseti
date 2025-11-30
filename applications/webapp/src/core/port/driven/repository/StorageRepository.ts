export interface StorageRepository {
  /**
   * Set a key-value pair in storage.
   *
   * @param key The key to set
   * @param value The value to set
   */
  setKey<TValue>(key: string, value: TValue): void;

  /**
   * Get a value by its key from storage.
   *
   * @param key The key to get
   * @returns The value associated with the key, or undefined if not found
   */
  getKey<TValue>(key: string): TValue | undefined;

  /**
   * Delete a key-value pair from storage.
   *
   * @param key The key to delete
   */
  deleteKey(key: string): void;
}
