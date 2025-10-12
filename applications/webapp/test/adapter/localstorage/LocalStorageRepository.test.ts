import { LocalStorageRepository } from "@/adapter/localstorage/LocalStorageRepository";

describe("LocalStorageRepository", () => {
  const sut = new LocalStorageRepository();

  describe("getKey", () => {
    it("should return undefined if the key does not exist", () => {
      const result = sut.getKey<string>("nonExistentKey");
      expect(result).toBeUndefined();
    });

    it("should return the value if the key exists", () => {
      localStorage.setItem("testKey", JSON.stringify("testValue"));
      const result = sut.getKey<string>("testKey");
      expect(result).toBe("testValue");
    });
  });

  describe("setKey", () => {
    it("should set a key-value pair in localStorage", () => {
      sut.setKey("newKey", "newValue");
      const result = localStorage.getItem("newKey");
      expect(result).toBe(JSON.stringify("newValue"));
    });
  });

  describe("deleteKey", () => {
    it("should remove the key from localStorage", () => {
      localStorage.setItem("keyToDelete", JSON.stringify("valueToDelete"));
      sut.deleteKey("keyToDelete");
      const result = localStorage.getItem("keyToDelete");
      expect(result).toBeNull();
    });
  });
});
