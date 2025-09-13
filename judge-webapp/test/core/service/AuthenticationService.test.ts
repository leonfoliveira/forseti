import { mock } from "jest-mock-extended";

import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockAuthenticateRequestDTO } from "@/test/mock/request/MockAuthenticateRequestDTO";

describe("AuthenticationService", () => {
  const authenticationRepository = mock<AuthenticationRepository>();

  const sut = new AuthenticationService(authenticationRepository);

  describe("authenticate", () => {
    it("should call authenticationRepository.authenticate with correct parameters", async () => {
      const contestId = "contest123";
      const requestDTO = MockAuthenticateRequestDTO();
      const authorization = MockAuthorization();
      authenticationRepository.authenticate.mockResolvedValue(authorization);

      const result = await sut.authenticate(contestId, requestDTO);

      expect(authenticationRepository.authenticate).toHaveBeenCalledWith(
        contestId,
        requestDTO,
      );
      expect(result).toEqual(authorization);
    });
  });
});
