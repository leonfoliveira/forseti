import { AuthorizationService } from "@/core/service/AuthorizationService";
import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { Authorization } from "@/core/domain/model/Authorization";
import { mock, MockProxy } from "jest-mock-extended";

jest.mock("@/core/repository/AuthorizationRepository");

describe("AuthorizationService", () => {
  let authorizationRepository: MockProxy<AuthorizationRepository>;
  let authorizationService: AuthorizationService;

  beforeEach(() => {
    authorizationRepository = mock<AuthorizationRepository>();
    authorizationService = new AuthorizationService(authorizationRepository);
  });

  describe("setAuthorization", () => {
    it("stores the authorization in the repository", () => {
      const authorization = mock<Authorization>();

      authorizationService.setAuthorization(authorization);

      expect(authorizationRepository.setAuthorization).toHaveBeenCalledWith(
        authorization,
      );
    });
  });

  describe("getAuthorization", () => {
    it("retrieves the authorization from the repository", () => {
      const authorization = mock<Authorization>();
      authorizationRepository.getAuthorization.mockReturnValue(authorization);

      const result = authorizationService.getAuthorization();

      expect(authorizationRepository.getAuthorization).toHaveBeenCalled();
      expect(result).toEqual(authorization);
    });

    it("returns undefined if no authorization is stored", () => {
      authorizationRepository.getAuthorization.mockReturnValue(undefined);

      const result = authorizationService.getAuthorization();

      expect(authorizationRepository.getAuthorization).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe("deleteAuthorization", () => {
    it("removes the authorization from the repository", () => {
      authorizationService.deleteAuthorization();

      expect(authorizationRepository.deleteAuthorization).toHaveBeenCalled();
    });
  });
});
