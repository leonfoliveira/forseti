import { mock } from "jest-mock-extended";

import { Authorization } from "@/core/domain/model/Authorization";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticationService } from "@/core/service/AuthenticationService";

describe("AuthenticationService", () => {
  const authenticationRepository = mock<AuthenticationRepository>();

  const sut = new AuthenticationService(authenticationRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuthorization", () => {
    it("should call authenticationRepository.getAuthorization", async () => {
      const authorization = { member: {} } as unknown as Authorization;
      authenticationRepository.getAuthorization.mockResolvedValue(
        authorization
      );

      const result = await sut.getAuthorization();

      expect(authenticationRepository.getAuthorization).toHaveBeenCalled();
      expect(result).toEqual(authorization);
    });
  });

  describe("cleanAuthorization", () => {
    it("should call authenticationRepository.cleanAuthorization", async () => {
      await sut.cleanAuthorization();

      expect(authenticationRepository.cleanAuthorization).toHaveBeenCalled();
    });
  });

  describe("authenticateRoot", () => {
    it("should call authenticationRepository.authenticateRoot with correct parameters", async () => {
      const requestDTO = { password: "password" };
      const authorization = {
        accessToken: "token",
      } as unknown as Authorization;
      authenticationRepository.authenticateRoot.mockResolvedValue(
        authorization
      );

      const result = await sut.authenticateRoot(requestDTO);

      expect(authenticationRepository.authenticateRoot).toHaveBeenCalledWith(
        requestDTO
      );
      expect(result).toEqual(authorization);
    });
  });

  describe("authenticateMember", () => {
    it("should call authenticationRepository.authenticateMember with correct parameters", async () => {
      const contestId = "contest123";
      const requestDTO = { login: "member", password: "password" };
      const authorization = {
        accessToken: "token",
      } as unknown as Authorization;
      authenticationRepository.authenticateMember.mockResolvedValue(
        authorization
      );

      const result = await sut.authenticateMember(contestId, requestDTO);

      expect(authenticationRepository.authenticateMember).toHaveBeenCalledWith(
        contestId,
        requestDTO
      );
      expect(result).toEqual(authorization);
    });
  });
});
