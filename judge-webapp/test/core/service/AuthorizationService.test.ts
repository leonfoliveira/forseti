import { mock } from "jest-mock-extended";

import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AuthorizationRepository } from "@/core/repository/AuthorizationRepository";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { signOut } from "@/lib/server-action/auth-action";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";

jest.mock("@/lib/server-action/auth-action", () => ({
  signOut: jest.fn(),
}));

describe("AuthorizationService", () => {
  const authorizationRepository = mock<AuthorizationRepository>();

  const sut = new AuthorizationService(authorizationRepository);

  describe("getAuthorization", () => {
    it("should call authorizationRepository.getAuthorization", async () => {
      const authorization = MockAuthorization();
      authorizationRepository.getAuthorization.mockResolvedValue(authorization);

      const result = await sut.getAuthorization();

      expect(authorizationRepository.getAuthorization).toHaveBeenCalled();
      expect(result).toEqual(authorization);
    });

    it("should return null if UnauthorizedException is thrown", async () => {
      authorizationRepository.getAuthorization.mockRejectedValue(
        new UnauthorizedException("Unauthorized"),
      );

      const result = await sut.getAuthorization();

      expect(result).toBeNull();
    });
  });

  describe("cleanAuthorization", () => {
    it("should call signOut action", async () => {
      await sut.cleanAuthorization();

      expect(signOut).toHaveBeenCalled();
    });
  });
});
