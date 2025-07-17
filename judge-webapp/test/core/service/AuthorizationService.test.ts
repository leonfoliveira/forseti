import { mock } from "jest-mock-extended";
import { StorageRepository } from "@/core/repository/StorageRepository";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { Authorization } from "@/core/domain/model/Authorization";

describe("AuthorizationService", () => {
  const storageRepository = mock<StorageRepository>();

  const sut = new AuthorizationService(storageRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setAuthorization", () => {
    it("should set authorization in storage", () => {
      const authorization = {
        accessToken: "token",
      } as unknown as Authorization;

      sut.setAuthorization(authorization);

      expect(storageRepository.setKey).toHaveBeenCalledWith(
        "authorization",
        authorization,
      );
    });
  });

  describe("getAuthorization", () => {
    it("should return authorization from storage if it exists and is not expired", () => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      const authorization = {
        expiresAt: expiresAt.toISOString(),
      } as unknown as Authorization;
      storageRepository.getKey.mockReturnValue(authorization);

      const result = sut.getAuthorization();

      expect(result).toEqual(authorization);
    });

    it("should return undefined if authorization is expired", () => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() - 1);
      const authorization = {
        expiresAt: expiresAt.toISOString(),
      } as unknown as Authorization;
      storageRepository.getKey.mockReturnValue(authorization);

      const result = sut.getAuthorization();

      expect(result).toBeUndefined();
      expect(storageRepository.deleteKey).toHaveBeenCalledWith("authorization");
    });

    it("should return undefined if authorization does not exist", () => {
      storageRepository.getKey.mockReturnValue(undefined);

      const result = sut.getAuthorization();

      expect(result).toBeUndefined();
    });
  });

  describe("deleteAuthorization", () => {
    it("should delete authorization from storage", () => {
      sut.deleteAuthorization();

      expect(storageRepository.deleteKey).toHaveBeenCalledWith("authorization");
    });
  });
});
