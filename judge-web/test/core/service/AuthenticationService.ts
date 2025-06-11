import { AuthenticationService } from "@/core/service/AuthenticationService";
import { AuthenticationRepository } from "@/core/repository/AuthenticationRepository";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { Authorization } from "@/core/domain/model/Authorization";
import { mock, MockProxy } from "jest-mock-extended";

describe("AuthenticationService", () => {
  let authenticationRepository: MockProxy<AuthenticationRepository>;
  let authorizationService: MockProxy<AuthorizationService>;
  let authenticationService: AuthenticationService;

  beforeEach(() => {
    authenticationRepository = mock<AuthenticationRepository>();
    authorizationService = mock<AuthorizationService>();
    authenticationService = new AuthenticationService(
      authenticationRepository,
      authorizationService,
    );
  });

  describe("authenticateRoot", () => {
    it("returns authorization and sets it in the authorization service", async () => {
      const requestDTO = mock<AuthenticateRootRequestDTO>();
      const authorization = mock<Authorization>();
      authenticationRepository.authenticateRoot.mockResolvedValue(
        authorization,
      );

      const result = await authenticationService.authenticateRoot(requestDTO);

      expect(result).toEqual(authorization);
    });
  });

  describe("authenticateMember", () => {
    it("returns authorization and sets it in the authorization service", async () => {
      const contestId = "1";
      const requestDTO = mock<AuthenticateMemberRequestDTO>();
      const authorization = mock<Authorization>();
      authenticationRepository.authenticateMember.mockResolvedValue(
        authorization,
      );

      const result = await authenticationService.authenticateMember(
        contestId,
        requestDTO,
      );

      expect(authenticationRepository.authenticateMember).toHaveBeenCalledWith(
        contestId,
        requestDTO,
      );
      expect(authorizationService.setAuthorization).toHaveBeenCalledWith(
        authorization,
      );
      expect(result).toEqual(authorization);
    });
  });
});
