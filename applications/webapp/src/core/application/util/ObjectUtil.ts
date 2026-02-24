export class ObjectUtil {
  /**
   * Removes the specified keys from the given object and returns a new object without those keys.
   *
   * @param object The original object from which keys should be removed.
   * @param keys The keys to be removed from the object.
   * @returns A new object that is a copy of the original object but without the specified keys.
   */
  static removeKeys<T extends Record<string, unknown>, K extends keyof T>(
    object: T,
    ...keys: K[]
  ): Omit<T, K> {
    const result = { ...object } as T;
    for (const key of keys) {
      delete (result as any)[key];
    }
    return result as Omit<T, K>;
  }
}
