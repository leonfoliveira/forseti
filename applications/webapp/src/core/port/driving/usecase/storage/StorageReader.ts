export interface StorageWritter {
  /**
   * Store a value associated with a key.
   *
   * @param key The key to associate the value with
   * @param value The value to store
   */
  setKey<TValue>(key: string, value: TValue): void;

  /**
   * Retrieve a value associated with a key.
   *
   * @param key The key whose associated value is to be returned
   * @return The value associated with the key, or undefined if not found
   */
  getKey<TValue>(key: string): TValue | undefined;
}
