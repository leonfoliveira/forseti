import { mock } from "jest-mock-extended";

import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthenticationService } from "@/core/service/AuthenticationService";
import { MockAuthenticateRequestDTO } from "@/test/mock/request/MockAuthenticateRequestDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";

describe("AuthenticationService", () => {
  const authenticationRepository = mock<AuthenticationRepository>();

  const sut = new AuthenticationService(authenticationRepository);

  describe("authenticate", () => {
    it("should call authenticationRepository.authenticate with correct parameters", async () => {
      const contestId = "contest123";
      const requestDTO = MockAuthenticateRequestDTO();
      const session = MockSession();
      authenticationRepository.authenticate.mockResolvedValue(session);

      const result = await sut.authenticate(contestId, requestDTO);

      expect(authenticationRepository.authenticate).toHaveBeenCalledWith(
        contestId,
        requestDTO,
      );
      expect(result).toEqual(session);
    });
  });
});
