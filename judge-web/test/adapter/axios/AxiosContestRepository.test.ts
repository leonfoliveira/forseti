import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/LeaderboardResponseDTO";
import { mock, MockProxy } from "jest-mock-extended";
import { AxiosResponse } from "axios";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/ContestPublicResponseDTO";

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
      const response = mock<ContestPrivateResponseDTO>();
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
      const contestId = 1;

      await contestRepository.deleteContest(contestId);

      expect(axiosClient.delete).toHaveBeenCalledWith(
        `/v1/contests/${contestId}`,
      );
    });
  });

  describe("findAllContests", () => {
    it("returns all contest summaries", async () => {
      const response = [mock<ContestSummaryResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findAllContests();

      expect(axiosClient.get).toHaveBeenCalledWith("/v1/contests");
      expect(result).toEqual(response);
    });
  });

  describe("findAllProblems", () => {
    it("returns all public problems for a contest", async () => {
      const contestId = 1;
      const response = [mock<ProblemPublicResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findAllProblems(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/problems`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("findAllSubmissions", () => {
    it("returns all submissions for a contest", async () => {
      const contestId = 1;
      const response = [mock<SubmissionPrivateResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findAllSubmissions(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/submissions`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("findContestById", () => {
    it("returns a public contest by ID", async () => {
      const contestId = 1;
      const response = mock<ContestPublicResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findContestById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(`/v1/contests/${contestId}`);
      expect(result).toEqual(response);
    });
  });

  describe("findContestByIdForRoot", () => {
    it("returns a private contest by ID for root", async () => {
      const contestId = 1;
      const response = mock<ContestPrivateResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findContestByIdForRoot(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/root`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("findContestSummaryById", () => {
    it("returns a contest summary by ID", async () => {
      const contestId = 1;
      const response = mock<ContestSummaryResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findContestSummaryById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/summary`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("getLeaderboard", () => {
    it("returns the leaderboard for a contest", async () => {
      const contestId = 1;
      const response = mock<LeaderboardResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.getLeaderboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("updateContest", () => {
    it("updates a contest and returns the private response DTO", async () => {
      const requestDTO = mock<UpdateContestRequestDTO>();
      const response = mock<ContestPrivateResponseDTO>();
      axiosClient.put.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.updateContest(requestDTO);

      expect(axiosClient.put).toHaveBeenCalledWith(`/v1/contests`, {
        data: requestDTO,
      });
      expect(result).toEqual(response);
    });
  });
});
