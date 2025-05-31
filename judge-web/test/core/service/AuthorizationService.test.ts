import { AuthorizationService } from "@/core/service/AuthorizationService";
import { Authorization } from "@/core/domain/model/Authorization";
import { mock, MockProxy } from "jest-mock-extended";
import { StorageRepository } from "@/core/repository/StorageRepository";

jest.mock("@/core/repository/StorageRepository");

describe("AuthorizationService", () => {
  let storageRepository: MockProxy<StorageRepository>;
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    storageRepository = mock<StorageRepository>();
    authorizationService = new AuthorizationService(storageRepository);
  });

  describe("setAuthorization", () => {
    it("stores the authorization in the repository", () => {
      const authorization = mock<Authorization>();

      authorizationService.setAuthorization(authorization);

      expect(storageRepository.setKey).toHaveBeenCalledWith(
        AuthorizationService.STORAGE_KEY,
        authorization,
      );
    });
  });

  describe("getAuthorization", () => {
    it("retrieves the authorization from the repository", () => {
      const authorization = mock<Authorization>();
      storageRepository.getKey.mockReturnValue(authorization);

      const result = authorizationService.getAuthorization();

      expect(storageRepository.getKey).toHaveBeenCalled();
      expect(result).toEqual(authorization);
    });

    it("returns undefined if no authorization is stored", () => {
      storageRepository.getKey.mockReturnValue(undefined);

      const result = authorizationService.getAuthorization();

      expect(storageRepository.getKey).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("deleteAuthorization", () => {
    it("removes the authorization from the repository", () => {
      authorizationService.deleteAuthorization();

      expect(storageRepository.deleteKey).toHaveBeenCalled();
    });
  });
});
