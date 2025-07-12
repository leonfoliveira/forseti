import { mock } from "jest-mock-extended";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { ContestService } from "@/core/service/ContestService";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { Attachment } from "@/core/domain/model/Attachment";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

describe("ClarificationService", () => {
  const contestRepository = mock<ContestRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new ContestService(contestRepository, attachmentService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createContest", () => {
    it("should create a contest with uploaded files", async () => {
      const newDescription = new File(["new content"], "new_description.txt");
      const newTestCases = new File(["test cases"], "test_cases.txt");
      const input = {
        name: "Test Contest",
        problems: [{ newDescription, newTestCases }],
      } as unknown as CreateContestInputDTO;
      const attachment = { id: "attachment-id" } as unknown as Attachment;
      attachmentService.upload.mockResolvedValue(attachment);

      await sut.createContest(input);

      expect(attachmentService.upload).toHaveBeenCalledWith(newDescription);
      expect(attachmentService.upload).toHaveBeenCalledWith(newTestCases);
      expect(contestRepository.createContest).toHaveBeenCalledWith({
        ...input,
        problems: [
          {
            ...input.problems[0],
            description: attachment,
            testCases: attachment,
          },
        ],
      });
    });
  });

  describe("updateContest", () => {
    it("should update a contest with uploaded files", async () => {
      const input = {
        id: "contest-id",
        name: "Updated Contest",
        problems: [
          {
            newDescription: undefined,
            description: { id: "description" },
            newTestCases: undefined,
            testCases: { id: "test-cases" },
          },
        ],
      } as unknown as UpdateContestInputDTO;

      await sut.updateContest(input);

      expect(attachmentService.upload).not.toHaveBeenCalled();
      expect(contestRepository.updateContest).toHaveBeenCalledWith({
        ...input,
        problems: [
          {
            ...input.problems[0],
          },
        ],
      });
    });
  });

  describe("findAllContestMetadata", () => {
    it("should return all contest metadata", async () => {
      const metadata = [
        { id: "contest1" },
        { id: "contest2" },
      ] as unknown as ContestMetadataResponseDTO[];
      contestRepository.findAllContestMetadata.mockResolvedValue(metadata);

      const result = await sut.findAllContestMetadata();

      expect(result).toEqual(metadata);
    });
  });

  describe("findContestById", () => {
    it("should return contest by id", async () => {
      const contest = { id: "contest-id" } as ContestPublicResponseDTO;
      contestRepository.findContestById.mockResolvedValue(contest);

      const result = await sut.findContestById("contest-id");

      expect(result).toEqual(contest);
    });
  });

  describe("findContestMetadataBySlug", () => {
    it("should return contest metadata by slug", async () => {
      const metadata = { id: "contest-id" } as ContestMetadataResponseDTO;
      contestRepository.findContestMetadataBySlug.mockResolvedValue(metadata);

      const result = await sut.findContestMetadataBySlug("contest-slug");

      expect(result).toEqual(metadata);
    });
  });

  describe("findFullContestById", () => {
    it("should return full contest by id", async () => {
      const contest = { id: "contest-id" } as ContestFullResponseDTO;
      contestRepository.findFullContestById.mockResolvedValue(contest);

      const result = await sut.findFullContestById("contest-id");

      expect(result).toEqual(contest);
    });
  });

  describe("findContestLeaderboardById", () => {
    it("should return contest leaderboard by id", async () => {
      const leaderboard = {
        contestId: "contest-id",
      } as unknown as ContestLeaderboardResponseDTO;
      contestRepository.findContestLeaderboardById.mockResolvedValue(
        leaderboard,
      );

      const result = await sut.findContestLeaderboardById("contest-id");

      expect(result).toEqual(leaderboard);
    });
  });

  describe("forceStart", () => {
    it("should force start a contest", async () => {
      const id = "contest-id";
      const metadata = { id: "contest-id" } as ContestMetadataResponseDTO;
      contestRepository.forceStart.mockResolvedValue(metadata);

      const result = await sut.forceStart(id);

      expect(result).toEqual(metadata);
    });
  });

  describe("forceEnd", () => {
    it("should force end a contest", async () => {
      const id = "contest-id";
      const metadata = { id: "contest-id" } as ContestMetadataResponseDTO;
      contestRepository.forceEnd.mockResolvedValue(metadata);

      const result = await sut.forceEnd(id);

      expect(result).toEqual(metadata);
    });
  });

  describe("deleteContest", () => {
    it("should delete a contest by id", async () => {
      const id = "contest-id";

      await sut.deleteContest(id);

      expect(contestRepository.deleteContest).toHaveBeenCalledWith(id);
    });
  });

  describe("findAllContestSubmissions", () => {
    it("should return all submissions for a contest", async () => {
      const submissions = [
        { id: "submission1" },
        { id: "submission2" },
      ] as unknown as SubmissionPublicResponseDTO[];
      contestRepository.findAllContestSubmissions.mockResolvedValue(
        submissions,
      );

      const result = await sut.findAllContestSubmissions("contest-id");

      expect(result).toEqual(submissions);
    });
  });

  describe("findAllContestFullSubmissions", () => {
    it("should return all full submissions for a contest", async () => {
      const submissions = [
        { id: "submission1" },
        { id: "submission2" },
      ] as unknown as SubmissionFullResponseDTO[];
      contestRepository.findAllContestFullSubmissions.mockResolvedValue(
        submissions,
      );

      const result = await sut.findAllContestFullSubmissions("contest-id");

      expect(result).toEqual(submissions);
    });
  });

  describe("createAnnouncement", () => {
    it("should create an announcement for a contest", async () => {
      const inputDTO = { text: "Test announcement" };
      const announcement = {
        id: "announcement-id",
      } as unknown as AnnouncementResponseDTO;
      contestRepository.createAnnouncement.mockResolvedValue(announcement);

      const result = await sut.createAnnouncement("contest-id", inputDTO);

      expect(result).toEqual(announcement);
      expect(contestRepository.createAnnouncement).toHaveBeenCalledWith(
        "contest-id",
        inputDTO,
      );
    });
  });

  describe("createClarification", () => {
    it("should create a clarification for a contest", async () => {
      const inputDTO = { text: "Test clarification" };
      const clarification = {
        id: "clarification-id",
      } as unknown as ClarificationResponseDTO;
      contestRepository.createClarification.mockResolvedValue(clarification);

      const result = await sut.createClarification("contest-id", inputDTO);

      expect(result).toEqual(clarification);
      expect(contestRepository.createClarification).toHaveBeenCalledWith(
        "contest-id",
        inputDTO,
      );
    });
  });
});
