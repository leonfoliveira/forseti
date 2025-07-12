import { mock } from "jest-mock-extended";
import { StorageRepository } from "@/core/repository/StorageRepository";
import { StorageService } from "@/core/service/StorageService";

describe("StorageService", () => {
  const storageRepository = mock<StorageRepository>();

  const sut = new StorageService(storageRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setKey", () => {
    it("should set key in storage", () => {
      const key = "test-key";
      const value = { data: "test" };

      sut.setKey(key, value);

      expect(storageRepository.setKey).toHaveBeenCalledWith(key, value);
    });
  });

  describe("getKey", () => {
    it("should return value from storage if it exists", () => {
      const key = "test-key";
      const value = { data: "test" };
      storageRepository.getKey.mockReturnValue(value);

      const result = sut.getKey<typeof value>(key);

      expect(result).toEqual(value);
    });

    it("should return undefined if key does not exist in storage", () => {
      const key = "non-existent-key";
      storageRepository.getKey.mockReturnValue(undefined);

      const result = sut.getKey(key);

      expect(result).toBeUndefined();
    });
  });

  describe("deleteKey", () => {
    it("should delete key from storage", () => {
      const key = "test-key";

      sut.deleteKey(key);

      expect(storageRepository.deleteKey).toHaveBeenCalledWith(key);
    });
  });
});
