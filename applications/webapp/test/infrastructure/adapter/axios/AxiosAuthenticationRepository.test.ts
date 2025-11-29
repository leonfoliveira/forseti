import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosAuthenticationRepository } from "@/infrastructure/adapter/axios/AxiosAuthenticationRepository";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { SessionResponseDTO } from "@/core/port/driven/repository/dto/response/session/SessionResponseDTO";
import { MockAuthenticateRequestDTO } from "@/test/mock/request/MockAuthenticateRequestDTO";

describe("AxiosAuthenticationRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAuthenticationRepository(axiosClient);

  describe("authenticate", () => {
    it("should authenticate a member and return a session", async () => {
      const requestDTO = MockAuthenticateRequestDTO();
      const expectedSession = {
        id: "123",
      } as unknown as SessionResponseDTO;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedSession,
      } as AxiosResponse);
      const contestId = "contest123";

      const result = await sut.authenticate(contestId, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/sign-in`,
        {
          data: requestDTO,
        },
      );
      expect(result).toEqual(expectedSession);
    });
  });
});
