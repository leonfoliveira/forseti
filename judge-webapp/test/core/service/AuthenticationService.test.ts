import { mock } from "jest-mock-extended";

import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { signOut } from "@/lib/action/auth-action";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockAuthenticateRequestDTO } from "@/test/mock/request/MockAuthenticateRequestDTO";

jest.mock("@/lib/action/auth-action");

describe("AuthenticationService", () => {
  const authenticationRepository = mock<AuthenticationRepository>();

  const sut = new AuthenticationService(authenticationRepository);

  describe("getAuthorization", () => {
    it("should call authenticationRepository.getAuthorization", async () => {
      const authorization = MockAuthorization();
      authenticationRepository.getAuthorization.mockResolvedValue(
        authorization,
      );

      const result = await sut.getAuthorization();

      expect(authenticationRepository.getAuthorization).toHaveBeenCalled();
      expect(result).toEqual(authorization);
    });

    it("should return null if UnauthorizedException is thrown", async () => {
      authenticationRepository.getAuthorization.mockRejectedValue(
        new UnauthorizedException("Unauthorized"),
      );

      const result = await sut.getAuthorization();

      expect(result).toBeNull();
    });
  });

  describe("cleanAuthorization", () => {
    it("should call authenticationRepository.cleanAuthorization", async () => {
      await sut.cleanAuthorization();

      expect(signOut).toHaveBeenCalled();
    });
  });

  describe("authenticate", () => {
    it("should call authenticationRepository.authenticate with correct parameters", async () => {
      const requestDTO = MockAuthenticateRequestDTO();
      const authorization = MockAuthorization();
      authenticationRepository.authenticate.mockResolvedValue(authorization);

      const result = await sut.authenticate(requestDTO);

      expect(authenticationRepository.authenticate).toHaveBeenCalledWith(
        requestDTO,
      );
      expect(result).toEqual(authorization);
    });
  });
});
