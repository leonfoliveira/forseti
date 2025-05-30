import { ContestService } from "@/core/service/ContestService";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";
import { mock, MockProxy } from "jest-mock-extended";
import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { ContestSummaryOutputDTOMap } from "@/core/service/dto/output/ContestSummaryOutputDTO";
import { ContestOutputDTOMap } from "@/core/service/dto/output/ContestOutputDTO";
import { ContestPublicOutputDTOMap } from "@/core/service/dto/output/ContestPublicOutputDTO";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/LeaderboardResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { CreateContestRequestDTO } from "@/core/repository/dto/request/CreateContestRequestDTO";

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
      const response = mock<ContestPrivateResponseDTO>({
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
      expect(result).toEqual(ContestOutputDTOMap.fromResponseDTO(response));
    });
  });

  describe("updateContest", () => {
    it("updates a contest and returns the mapped response", async () => {
      const input = mock<UpdateContestInputDTO>({
        problems: [mock<UpdateContestInputDTO["problems"][number]>()],
      });
      const uploadedDescription = mock<Attachment>();
      const uploadedTestCases = mock<Attachment>();
      const response = mock<ContestPrivateResponseDTO>({
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
      expect(result).toEqual(ContestOutputDTOMap.fromResponseDTO(response));
    });
  });

  describe("findAllContests", () => {
    it("returns all contests mapped to summary DTOs", async () => {
      const response = mock<ContestSummaryResponseDTO[]>();
      contestRepository.findAllContests.mockResolvedValue(response);

      const result = await contestService.findAllContests();

      expect(contestRepository.findAllContests).toHaveBeenCalled();
      expect(result).toEqual(
        response.map(ContestSummaryOutputDTOMap.fromResponseDTO),
      );
    });
  });

  describe("findContestByIdForRoot", () => {
    it("returns a contest by id for root users", async () => {
      const id = 1;
      const response = mock<ContestPrivateResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });
      contestRepository.findContestByIdForRoot.mockResolvedValue(response);

      const result = await contestService.findContestByIdForRoot(id);

      expect(contestRepository.findContestByIdForRoot).toHaveBeenCalledWith(id);
      expect(result).toEqual(ContestOutputDTOMap.fromResponseDTO(response));
    });
  });

  describe("findContestById", () => {
    it("returns a contest by id for public users", async () => {
      const id = 1;
      const response = mock<ContestPrivateResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });
      contestRepository.findContestById.mockResolvedValue(response);

      const result = await contestService.findContestById(id);

      expect(contestRepository.findContestById).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        ContestPublicOutputDTOMap.fromResponseDTO(response),
      );
    });
  });

  describe("findContestSummaryById", () => {
    it("returns a contest summary by id", async () => {
      const id = 1;
      const response = mock<ContestSummaryResponseDTO>({
        startAt: "2023-01-01T00:00:00Z",
        endAt: "2023-01-01T00:00:00Z",
      });
      contestRepository.findContestSummaryById.mockResolvedValue(response);

      const result = await contestService.findContestSummaryById(id);

      expect(contestRepository.findContestSummaryById).toHaveBeenCalledWith(id);
      expect(result).toEqual(
        ContestSummaryOutputDTOMap.fromResponseDTO(response),
      );
    });
  });

  describe("deleteContest", () => {
    it("deletes a contest by id", async () => {
      const id = 1;

      await contestService.deleteContest(id);

      expect(contestRepository.deleteContest).toHaveBeenCalledWith(id);
    });
  });

  describe("getLeaderboard", () => {
    it("returns the leaderboard for a contest", async () => {
      const id = 1;
      const leaderboard = mock<LeaderboardResponseDTO>();
      contestRepository.getLeaderboard.mockResolvedValue(leaderboard);

      const result = await contestService.getLeaderboard(id);

      expect(contestRepository.getLeaderboard).toHaveBeenCalledWith(id);
      expect(result).toEqual(leaderboard);
    });
  });

  describe("findAllProblems", () => {
    it("returns all problems for a contest", async () => {
      const id = 1;
      const problems = [mock<ProblemPublicResponseDTO>()];
      contestRepository.findAllProblems.mockResolvedValue(problems);

      const result = await contestService.findAllProblems(id);

      expect(contestRepository.findAllProblems).toHaveBeenCalledWith(id);
      expect(result).toEqual(problems);
    });
  });

  describe("findAllProblemsForMember", () => {
    it("returns all problems for a contest for a member", async () => {
      const id = 1;
      const problems = [mock<ProblemMemberResponseDTO>()];
      contestRepository.findAllProblemsForMember.mockResolvedValue(problems);

      const result = await contestService.findAllProblemsForMember(id);

      expect(contestRepository.findAllProblemsForMember).toHaveBeenCalledWith(
        id,
      );
      expect(result).toEqual(problems);
    });
  });

  describe("findAllSubmissions", () => {
    it("returns all submissions for a contest", async () => {
      const id = 1;
      const submissions = [mock<SubmissionPublicResponseDTO>()];
      contestRepository.findAllSubmissions.mockResolvedValue(submissions);

      const result = await contestService.findAllSubmissions(id);

      expect(contestRepository.findAllSubmissions).toHaveBeenCalledWith(id);
      expect(result).toEqual(submissions);
    });
  });
});
