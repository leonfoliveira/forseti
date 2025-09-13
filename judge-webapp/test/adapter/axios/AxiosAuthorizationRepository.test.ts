import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosAuthorizationRepository } from "@/adapter/axios/AxiosAuthorizationRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";

describe("AxiosAuthorizationRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosAuthorizationRepository(axiosClient);

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
});
