import { LocalStorageRepository } from "@/adapter/localstorage/LocalStorageRepository";

describe("LocalStorageRepository", () => {
  let localStorageRepository: LocalStorageRepository;

  beforeEach(() => {
    localStorageRepository = new LocalStorageRepository();
    localStorage.clear();
  });

  describe("getKey", () => {
    it("returns the parsed value when the key exists in localStorage", () => {
      const key = "testKey";
      const value = { data: "testValue" };
      localStorage.setItem(key, JSON.stringify(value));

      const result = localStorageRepository.getKey<typeof value>(key);

      expect(result).toEqual(value);
    });

    it("returns undefined when the key does not exist in localStorage", () => {
      const result = localStorageRepository.getKey("nonExistentKey");

      expect(result).toBeUndefined();
    });

    it("throws an error if the stored value is not valid JSON", () => {
      const key = "invalidKey";
      localStorage.setItem(key, "invalidJSON");

      expect(() => localStorageRepository.getKey(key)).toThrow(SyntaxError);
    });
  });

  describe("setKey", () => {
    it("stores the value as a JSON string in localStorage", () => {
      const key = "testKey";
      const value = { data: "testValue" };

      localStorageRepository.setKey(key, value);

      expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
    });
  });

  describe("deleteKey", () => {
    it("removes the key from localStorage", () => {
      const key = "testKey";
      localStorage.setItem(key, "testValue");

      localStorageRepository.deleteKey(key);

      expect(localStorage.getItem(key)).toBeNull();
    });

    it("does nothing if the key does not exist in localStorage", () => {
      const key = "nonExistentKey";

      localStorageRepository.deleteKey(key);

      expect(localStorage.getItem(key)).toBeNull();
    });
  });
});
