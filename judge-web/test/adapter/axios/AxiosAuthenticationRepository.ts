import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AuthenticateMemberRequestDTO } from "@/core/repository/dto/request/AuthenticateMemberRequestDTO";
import { AuthenticateRootRequestDTO } from "@/core/repository/dto/request/AuthenticateRootRequestDTO";
import { Authorization } from "@/core/domain/model/Authorization";
import { mock, MockProxy } from "jest-mock-extended";
import { AxiosResponse } from "axios";

describe("AxiosAuthenticationRepository", () => {
  let axiosClient: MockProxy<AxiosClient>;
  let authenticationRepository: AxiosAuthenticationRepository;

  beforeEach(() => {
    axiosClient = mock<AxiosClient>();
    authenticationRepository = new AxiosAuthenticationRepository(axiosClient);
  });

  describe("authenticateMember", () => {
    it("authenticates a member and returns the authorization", async () => {
      const contestId = 1;
      const requestDTO = mock<AuthenticateMemberRequestDTO>();
      const response = mock<Authorization>();
      axiosClient.post.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await authenticationRepository.authenticateMember(
        contestId,
        requestDTO,
      );

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/auth/contests/${contestId}`,
        {
          data: requestDTO,
        },
      );
      expect(result).toEqual(response);
    });
  });

  describe("authenticateRoot", () => {
    it("authenticates a root user and returns the authorization", async () => {
      const requestDTO = mock<AuthenticateRootRequestDTO>();
      const response = mock<Authorization>();
      axiosClient.post.mockResolvedValue({ data: response } as AxiosResponse);

      const result =
        await authenticationRepository.authenticateRoot(requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/auth/root", {
        data: requestDTO,
      });
      expect(result).toEqual(response);
    });
  });
});
