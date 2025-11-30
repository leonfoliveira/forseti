export interface StorageReader {
  /**
   * Retrieve a value associated with a key.
   *
   * @param key The key whose associated value is to be returned
   * @return The value associated with the key, or undefined if not found
   */
  getKey<TValue>(key: string): TValue | undefined;
}
