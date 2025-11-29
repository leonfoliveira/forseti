import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosContestRepository } from "@/infrastructure/adapter/axios/repository/AxiosContestRepository";
import { MockUpdateContestRequestDTO } from "@/test/mock/request/MockUpdateContestRequestDTO";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";

describe("AxiosContestRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosContestRepository(axiosClient);

  const contestId = uuidv4();

  describe("updateContest", () => {
    it("should update a contest and return the full response", async () => {
      const requestDTO = MockUpdateContestRequestDTO();
      const expectedResponse = MockUpdateContestRequestDTO();
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.updateContest(requestDTO);

      expect(axiosClient.put).toHaveBeenCalledWith("/v1/contests", {
        data: requestDTO,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllContestMetadata", () => {
    it("should return an array of contest metadata", async () => {
      const expectedResponse = [
        MockContestMetadataResponseDTO(),
        MockContestMetadataResponseDTO(),
      ];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllContestMetadata();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/contests/metadata");
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findContestById", () => {
    it("should return a public contest response", async () => {
      const expectedResponse = MockContestPublicResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findContestById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(`/v1/contests/${contestId}`);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findContestMetadataBySlug", () => {
    it("should return contest metadata by slug", async () => {
      const slug = "contest-1";
      const expectedResponse = MockContestMetadataResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findContestMetadataBySlug(slug);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/slug/${slug}/metadata`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findFullContestById", () => {
    it("should return a full contest response", async () => {
      const expectedResponse = MockContestFullResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findFullContestById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/full`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("forceStart", () => {
    it("should force start a contest and return metadata", async () => {
      const expectedResponse = MockContestMetadataResponseDTO();
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.forceStart(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/start`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("forceEnd", () => {
    it("should force end a contest and return metadata", async () => {
      const expectedResponse = MockContestMetadataResponseDTO();
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.forceEnd(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/end`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
