import { ContestService } from "@/core/service/ContestService";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";
import { mock, MockProxy } from "jest-mock-extended";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";
import { ContestUtil } from "@/core/util/contest-util";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

jest.mock("@/core/repository/ContestRepository");
jest.mock("@/core/service/AttachmentService");

describe("ContestService", () => {
  let contestRepository: MockProxy<ContestRepository>;
  let attachmentService: jest.Mocked<AttachmentService>;
  let contestService: ContestService;

  beforeEach(() => {
    contestRepository = mock<ContestRepository>();
    attachmentService = mock<AttachmentService>();
    contestService = new ContestService(contestRepository, attachmentService);
  });

  describe("createContest", () => {
    it("creates a contest and returns the mapped response", async () => {
      const input = mock<CreateContestInputDTO>({
        problems: [mock<CreateContestRequestDTO["problems"][number]>()],
      });
      const uploadedDescription = mock<Attachment>();
      const uploadedTestCases = mock<Attachment>();
      const response = mock<ContestFullResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });

      attachmentService.upload.mockResolvedValueOnce(uploadedDescription);
      attachmentService.upload.mockResolvedValueOnce(uploadedTestCases);
      contestRepository.createContest.mockResolvedValue(response);

      const result = await contestService.createContest(input);

      expect(attachmentService.upload).toHaveBeenCalledTimes(2);
      expect(contestRepository.createContest).toHaveBeenCalledWith({
        ...input,
        problems: [
          {
            ...input.problems[0],
            description: uploadedDescription,
            testCases: uploadedTestCases,
          },
        ],
      });
      expect(result).toEqual(ContestUtil.addStatus(result));
    });
  });

  describe("updateContest", () => {
    it("updates a contest and returns the mapped response", async () => {
      const input = mock<UpdateContestInputDTO>({
        problems: [mock<UpdateContestInputDTO["problems"][number]>()],
      });
      const uploadedDescription = mock<Attachment>();
      const uploadedTestCases = mock<Attachment>();
      const response = mock<ContestFullResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });

      attachmentService.upload.mockResolvedValueOnce(uploadedDescription);
      attachmentService.upload.mockResolvedValueOnce(uploadedTestCases);
      contestRepository.updateContest.mockResolvedValue(response);

      const result = await contestService.updateContest(input);

      expect(attachmentService.upload).toHaveBeenCalledTimes(2);
      expect(contestRepository.updateContest).toHaveBeenCalledWith({
        ...input,
        problems: [
          {
            ...input.problems[0],
            description: uploadedDescription,
            testCases: uploadedTestCases,
          },
        ],
      });
      expect(result).toEqual(ContestUtil.addStatus(result));
    });
  });

  describe("findAllContests", () => {
    it("returns all contests mapped to summary DTOs", async () => {
      const response = mock<ContestMetadataResponseDTO[]>();
      contestRepository.findAllContestMetadata.mockResolvedValue(response);

      const result = await contestService.findAllContestMetadata();

      expect(contestRepository.findAllContestMetadata).toHaveBeenCalled();
      expect(result).toEqual(response.map(ContestUtil.addStatus));
    });
  });

  describe("findContestByIdForRoot", () => {
    it("returns a contest by id for root users", async () => {
      const id = "abc";
      const response = mock<ContestFullResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });
      contestRepository.findFullContestById.mockResolvedValue(response);

      const result = await contestService.findFullContestById(id);

      expect(contestRepository.findFullContestById).toHaveBeenCalledWith(id);
      expect(result).toEqual(ContestUtil.addStatus(response));
    });
  });

  describe("findContestById", () => {
    it("returns a contest by id for public users", async () => {
      const id = "abc";
      const response = mock<ContestPublicResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });
      contestRepository.findContestById.mockResolvedValue(response);

      const result = await contestService.findContestById(id);

      expect(contestRepository.findContestById).toHaveBeenCalledWith(id);
      expect(result).toEqual(ContestUtil.addStatus(response));
    });
  });

  describe("findContestMetadataBySlug", () => {
    it("returns a contest summary by id", async () => {
      const id = "abc";
      const response = mock<ContestMetadataResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });
      contestRepository.findContestMetadataBySlug.mockResolvedValue(response);

      const result = await contestService.findContestMetadataBySlug(id);

      expect(contestRepository.findContestMetadataBySlug).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(ContestUtil.addStatus(response));
    });
  });

  describe("findContestLeaderboardById", () => {
    it("returns the leaderboard for a contest", async () => {
      const id = "abc";
      const leaderboard = mock<ContestLeaderboardResponseDTO>();
      contestRepository.findContestLeaderboardById.mockResolvedValue(
        leaderboard,
      );

      const result = await contestService.findContestLeaderboardById(id);

      expect(contestRepository.findContestLeaderboardById).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(leaderboard);
    });
  });

  describe("deleteContest", () => {
    it("deletes a contest by id", async () => {
      const id = "abc";

      await contestService.deleteContest(id);

      expect(contestRepository.deleteContest).toHaveBeenCalledWith(id);
    });
  });

  describe("findAllSubmissions", () => {
    it("returns all submissions for a contest", async () => {
      const id = "abc";
      const submissions = [mock<SubmissionPublicResponseDTO>()];
      contestRepository.findAllContestSubmissions.mockResolvedValue(
        submissions,
      );

      const result = await contestService.findAllContestSubmissions(id);

      expect(contestRepository.findAllContestSubmissions).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(submissions);
    });
  });

  describe("findAllFullSubmissions", () => {
    it("returns all full submissions for a contest", async () => {
      const id = "abc";
      const submissions = [mock<SubmissionFullResponseDTO>()];
      contestRepository.findAllContestFullSubmissions.mockResolvedValue(
        submissions,
      );

      const result = await contestService.findAllContestFullSubmissions(id);

      expect(
        contestRepository.findAllContestFullSubmissions,
      ).toHaveBeenCalledWith(id);
      expect(result).toEqual(submissions);
    });
  });
});
