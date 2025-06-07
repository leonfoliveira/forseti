import { AxiosContestRepository } from "@/adapter/axios/AxiosContestRepository";
import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { UpdateContestRequestDTO } from "@/core/repository/dto/request/UpdateContestRequestDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/ContestMetadataResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { mock, MockProxy } from "jest-mock-extended";
import { AxiosResponse } from "axios";

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

  describe("findAllProblems", () => {
    it("returns all public problems for a contest", async () => {
      const contestId = "abc";
      const response = [mock<ProblemPublicResponseDTO>()];
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findAllProblems(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/problems`,
      );
      expect(result).toEqual(response);
    });
  });

  describe("contestRepository", () => {
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
      const response = mock<ContestResponseDTO>();
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

  describe("findContestMetadataById", () => {
    it("returns a contest metadata by ID", async () => {
      const contestId = "abc";
      const response = mock<ContestMetadataResponseDTO>();
      axiosClient.get.mockResolvedValue({ data: response } as AxiosResponse);

      const result = await contestRepository.findContestMetadataById(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/metadata`,
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
});
