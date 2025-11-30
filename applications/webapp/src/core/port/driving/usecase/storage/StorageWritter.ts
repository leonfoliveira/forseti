export interface StorageWritter {
  /**
   * Store a value associated with a key.
   *
   * @param key The key to associate the value with
   * @param value The value to store
   */
  setKey<TValue>(key: string, value: TValue): void;

  /**
   * Delete a value associated with a key.
   *
   * @param key The key whose associated value is to be deleted
   */
  deleteKey(key: string): void;
}
