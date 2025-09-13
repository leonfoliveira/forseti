import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { Authorization } from "@/core/domain/model/Authorization";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockAuthenticateRequestDTO } from "@/test/mock/request/MockAuthenticateRequestDTO";

describe("AxiosAuthenticationRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAuthenticationRepository(axiosClient);

  describe("getAuthorization", () => {
    it("should return an authorization", async () => {
      const authorization = MockAuthorization();
      axiosClient.get.mockResolvedValueOnce({
        data: authorization,
      } as AxiosResponse);

      const result = await sut.getAuthorization();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/auth/me");
      expect(result).toEqual(authorization);
    });
  });

  describe("authenticate", () => {
    it("should authenticate a member and return an authorization", async () => {
      const requestDTO = MockAuthenticateRequestDTO();
      const expectedAuthorization = {
        token: "authToken",
      } as unknown as Authorization;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedAuthorization,
      } as AxiosResponse);
      const contestId = "contest123";

      const result = await sut.authenticate(contestId, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/sign-in`,
        {
          data: requestDTO,
        },
      );
      expect(result).toEqual(expectedAuthorization);
    });
  });
});
