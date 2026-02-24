import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosContestRepository } from "@/infrastructure/adapter/axios/repository/AxiosContestRepository";
import { MockUpdateContestRequestDTO } from "@/test/mock/request/MockUpdateContestRequestDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";

describe("AxiosContestRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosContestRepository(axiosClient);

  const contestId = uuidv4();

  describe("update", () => {
    it("should update a contest and return the full response", async () => {
      const requestDTO = MockUpdateContestRequestDTO();
      const expectedResponse = MockUpdateContestRequestDTO();
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.update(contestId, requestDTO);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}`,
        {
          data: requestDTO,
        },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findBySlug", () => {
    it("should return contest by slug", async () => {
      const slug = "contest-1";
      const expectedResponse = MockContestResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findBySlug(slug);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/public/contests/slug/${slug}`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("forceStart", () => {
    it("should force start a contest", async () => {
      const expectedResponse = MockContestResponseDTO();
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.forceStart(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}:force-start`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("forceEnd", () => {
    it("should force end a contest", async () => {
      const expectedResponse = MockContestResponseDTO();
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.forceEnd(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}:force-end`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
