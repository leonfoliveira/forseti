import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosSessionRepository } from "@/infrastructure/adapter/axios/AxiosSessionRepository";
import { MockSession } from "@/test/mock/response/session/MockSession";

describe("AxiosSessionRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosSessionRepository(axiosClient);

  describe("getSession", () => {
    it("should return a session", async () => {
      const session = MockSession();
      axiosClient.get.mockResolvedValueOnce({
        data: session,
      } as AxiosResponse);

      const result = await sut.getSession();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/session/me");
      expect(result).toEqual(session);
    });
  });

  describe("deleteSession", () => {
    it("should delete the session", async () => {
      await sut.deleteSession();
      expect(axiosClient.delete).toHaveBeenCalledWith("/v1/session/me");
    });
  });
});
