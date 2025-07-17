import { mock } from "jest-mock-extended";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosAuthenticationRepository } from "@/adapter/axios/AxiosAuthenticationRepository";
import { Authorization } from "@/core/domain/model/Authorization";
import { AxiosResponse } from "axios";

describe("AxiosAuthenticationRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAuthenticationRepository(axiosClient);

  describe("authenticateMember", () => {
    it("should authenticate a member and return an authorization", async () => {
      const contestId = "contest123";
      const requestDTO = { login: "member", password: "password" };
      const expectedAuthorization = {
        token: "authToken",
      } as unknown as Authorization;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedAuthorization,
      } as AxiosResponse);

      const result = await sut.authenticateMember(contestId, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/auth/contests/${contestId}/sign-in`,
        { data: requestDTO },
      );
      expect(result).toEqual(expectedAuthorization);
    });
  });

  describe("authenticateRoot", () => {
    it("should authenticate root and return an authorization", async () => {
      const requestDTO = { password: "rootPassword" };
      const expectedAuthorization = {
        token: "rootAuthToken",
      } as unknown as Authorization;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedAuthorization,
      } as AxiosResponse);

      const result = await sut.authenticateRoot(requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/auth/sign-in", {
        data: {
          login: "root",
          password: requestDTO.password,
        },
      });
      expect(result).toEqual(expectedAuthorization);
    });
  });
});
