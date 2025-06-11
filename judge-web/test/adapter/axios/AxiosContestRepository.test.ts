import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { mock, MockProxy } from "jest-mock-extended";
import { AxiosResponse } from "axios";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

describe("AxiosContestRepository", () => {
  let axiosClient: MockProxy<AxiosClient>;
  let contestRepository: AxiosContestRepository;

  beforeEach(() => {
    axiosClient = mock<AxiosClient>();
    contestRepository = new AxiosContestRepository(axiosClient);
  });

  describe("createContest", () => {
    it("creates a contest and returns the private response DTO", async () => {
      const requestDTO = mock<CreateContestRequestDTO>();
      const response = mock<ContestFullResponseDTO>();
      axiosClient.post.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.createContest(requestDTO);

      expect(axiosClient.post).toHaveBeenCalledWith("/v1/contests", {
        data: requestDTO,
      });
      expect(result).toEqual(response);
    });
  });

  describe("deleteContest", () => {
    it("deletes a contest by ID", async () => {
      const contestId = "abc";

      await contestRepository.deleteContest(contestId);

      expect(axiosClient.delete).toHaveBeenCalledWith(
        `/v1/contests/${contestId}`,
      );
    });
  });

  describe("findAllContestsMetadata", () => {
    it("returns all contest metadata", async () => {
      const response = [mock<ContestMetadataResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findAllContestMetadata();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/contests/metadata");
      expect(result).toEqual(response);
    });
  });

  describe("findAllContestSubmissions", () => {
    it("returns all submissions for a contest", async () => {
      const contestId = "abc";
      const response = [mock<SubmissionFullResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result =
        await contestRepository.findAllContestSubmissions(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("findContestById", () => {
    it("returns a public contest by ID", async () => {
      const contestId = "abc";
      const response = mock<ContestPublicResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findContestById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(`/v1/contests/${contestId}`);
      expect(result).toEqual(response);
    });
  });

  describe("findFullContestByIdForRoot", () => {
    it("returns a full contest by ID for root", async () => {
      const contestId = "abc";
      const response = mock<ContestFullResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findFullContestById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/full`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("findContestMetadataBySlug", () => {
    it("returns a contest metadata by slug", async () => {
      const slug = "slug";
      const response = mock<ContestMetadataResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findContestMetadataBySlug(slug);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/slug/${slug}/metadata`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("updateContest", () => {
    it("updates a contest and returns the private response DTO", async () => {
      const requestDTO = mock<UpdateContestRequestDTO>();
      const response = mock<ContestFullResponseDTO>();
      axiosClient.put.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.updateContest(requestDTO);

      expect(axiosClient.put).toHaveBeenCalledWith(`/v1/contests`, {
        data: requestDTO,
      });
      expect(result).toEqual(response);
    });
  });

  describe("findContestLeaderboardById", () => {
    it("returns the leaderboard for a contest by ID", async () => {
      const contestId = "abc";
      const response = mock<ContestLeaderboardResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result =
        await contestRepository.findContestLeaderboardById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("findAllContestFullSubmissions", () => {
    it("returns all full submissions for a contest", async () => {
      const contestId = "abc";
      const response = [mock<SubmissionFullResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result =
        await contestRepository.findAllContestFullSubmissions(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions/full`,
      );
      expect(result).toEqual(response);
    });
  });
});
