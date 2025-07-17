import { mock } from "jest-mock-extended";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { AxiosResponse } from "axios";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";

describe("AxiosContestRepository", () => {
  const axiosClient = mock<AxiosClient>();
  const sut = new AxiosContestRepository(axiosClient);

  describe("createContest", () => {
    it("should create a contest and return the full response", async () => {
      const requestDTO = {
        title: "Contest 1",
      } as unknown as CreateContestRequestDTO;
      const expectedResponse = { id: "contest123" } as ContestFullResponseDTO;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createContest(requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/contests", {
        data: requestDTO,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("updateContest", () => {
    it("should update a contest and return the full response", async () => {
      const requestDTO = {
        id: "contest123",
        title: "Contest 1 Updated",
      } as unknown as UpdateContestRequestDTO;
      const expectedResponse = {
        id: "contest123",
        title: "Contest 1 Updated",
      } as unknown as ContestFullResponseDTO;
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
        { id: "contest123" },
      ] as ContestMetadataResponseDTO[];
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
      const id = "contest123";
      const expectedResponse = { id: "contest123" } as ContestPublicResponseDTO;
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findContestById(id);

      expect(axiosClient.get).toHaveBeenCalledWith(`/v1/contests/${id}`);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findContestMetadataBySlug", () => {
    it("should return contest metadata by slug", async () => {
      const slug = "contest-1";
      const expectedResponse = {
        id: "contest123",
      } as ContestMetadataResponseDTO;
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
      const id = "contest123";
      const expectedResponse = { id: "contest123" } as ContestFullResponseDTO;
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findFullContestById(id);

      expect(axiosClient.get).toHaveBeenCalledWith(`/v1/contests/${id}/full`);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findContestLeaderboardById", () => {
    it("should return a contest leaderboard", async () => {
      const id = "contest123";
      const expectedResponse = {
        id: "contest123",
      } as unknown as ContestLeaderboardResponseDTO;
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findContestLeaderboardById(id);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${id}/leaderboard`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("forceStart", () => {
    it("should force start a contest and return metadata", async () => {
      const id = "contest123";
      const expectedResponse = {
        id: "contest123",
      } as ContestMetadataResponseDTO;
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.forceStart(id);

      expect(axiosClient.put).toHaveBeenCalledWith(`/v1/contests/${id}/start`);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("forceEnd", () => {
    it("should force end a contest and return metadata", async () => {
      const id = "contest123";
      const expectedResponse = {
        id: "contest123",
      } as ContestMetadataResponseDTO;
      axiosClient.put.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.forceEnd(id);

      expect(axiosClient.put).toHaveBeenCalledWith(`/v1/contests/${id}/end`);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("deleteContest", () => {
    it("should delete a contest", async () => {
      const id = "contest123";

      await sut.deleteContest(id);

      expect(axiosClient.delete).toHaveBeenCalledWith(`/v1/contests/${id}`);
    });
  });

  describe("findAllContestSubmissions", () => {
    it("should return an array of public submissions", async () => {
      const id = "contest123";
      const expectedResponse = [
        { id: "submission123" },
      ] as SubmissionPublicResponseDTO[];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllContestSubmissions(id);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${id}/submissions`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("findAllContestFullSubmissions", () => {
    it("should return an array of full submissions", async () => {
      const id = "contest123";
      const expectedResponse = [
        { id: "submission123" },
      ] as SubmissionFullResponseDTO[];
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findAllContestFullSubmissions(id);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${id}/submissions/full`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("createAnnouncement", () => {
    it("should create an announcement and return the response", async () => {
      const id = "contest123";
      const requestDTO = { title: "Announcement" } as any;
      const expectedResponse = {
        id: "announcement123",
      } as AnnouncementResponseDTO;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createAnnouncement(id, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${id}/announcements`,
        { data: requestDTO },
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("createClarification", () => {
    it("should create a clarification and return the response", async () => {
      const id = "contest123";
      const requestDTO = { question: "Question?" } as any;
      const expectedResponse = {
        id: "clarification123",
      } as ClarificationResponseDTO;
      axiosClient.post.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.createClarification(id, requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith(
        `/v1/contests/${id}/clarifications`,
        { data: requestDTO },
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
