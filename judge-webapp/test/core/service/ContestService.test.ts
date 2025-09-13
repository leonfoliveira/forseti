import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { ContestRepository } from "@/core/repository/ContestRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { ContestService } from "@/core/service/ContestService";
import { MockUpdateContestInputDTO } from "@/test/mock/input/MockUpdateContestInputDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";

describe("ClarificationService", () => {
  const contestRepository = mock<ContestRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new ContestService(contestRepository, attachmentService);

  const contestId = uuidv4();

  describe("updateContest", () => {
    it("should update a contest without upload files", async () => {
      const inputDTO = MockUpdateContestInputDTO();
      inputDTO.problems[0].newDescription = undefined;
      inputDTO.problems[0].newTestCases = undefined;

      await sut.updateContest(inputDTO);

      expect(attachmentService.upload).not.toHaveBeenCalled();
      expect(contestRepository.updateContest).toHaveBeenCalledWith(inputDTO);
    });

    it("should update a contest with upload files", async () => {
      const inputDTO = MockUpdateContestInputDTO();
      const attachment = MockAttachment();
      attachmentService.upload.mockResolvedValue(attachment);

      await sut.updateContest(inputDTO);

      expect(attachmentService.upload).toHaveBeenCalledWith(
        inputDTO.id,
        AttachmentContext.PROBLEM_DESCRIPTION,
        inputDTO.problems[0].newDescription,
      );
      expect(attachmentService.upload).toHaveBeenCalledWith(
        inputDTO.id,
        AttachmentContext.PROBLEM_TEST_CASES,
        inputDTO.problems[0].newTestCases,
      );
      expect(contestRepository.updateContest).toHaveBeenCalledWith({
        ...inputDTO,
        problems: [
          {
            ...inputDTO.problems[0],
            description: attachment,
            testCases: attachment,
          },
        ],
      });
    });
  });

  describe("findAllContestMetadata", () => {
    it("should return all contest metadata", async () => {
      const metadata = [
        MockContestMetadataResponseDTO(),
        MockContestMetadataResponseDTO(),
      ];
      contestRepository.findAllContestMetadata.mockResolvedValue(metadata);

      const result = await sut.findAllContestMetadata();

      expect(result).toEqual(metadata);
    });
  });

  describe("findContestById", () => {
    it("should return contest by id", async () => {
      const contest = MockContestPublicResponseDTO();
      contestRepository.findContestById.mockResolvedValue(contest);

      const result = await sut.findContestById(contestId);

      expect(result).toEqual(contest);
    });
  });

  describe("findContestMetadataBySlug", () => {
    it("should return contest metadata by slug", async () => {
      const metadata = MockContestMetadataResponseDTO();
      contestRepository.findContestMetadataBySlug.mockResolvedValue(metadata);

      const result = await sut.findContestMetadataBySlug("contest-slug");

      expect(result).toEqual(metadata);
    });
  });

  describe("findFullContestById", () => {
    it("should return full contest by id", async () => {
      const contest = MockContestFullResponseDTO();
      contestRepository.findFullContestById.mockResolvedValue(contest);

      const result = await sut.findFullContestById(contestId);

      expect(result).toEqual(contest);
    });
  });

  describe("forceStart", () => {
    it("should force start a contest", async () => {
      const metadata = MockContestMetadataResponseDTO();
      contestRepository.forceStart.mockResolvedValue(metadata);

      const result = await sut.forceStart(contestId);

      expect(result).toEqual(metadata);
    });
  });

  describe("forceEnd", () => {
    it("should force end a contest", async () => {
      const metadata = MockContestMetadataResponseDTO();
      contestRepository.forceEnd.mockResolvedValue(metadata);

      const result = await sut.forceEnd(contestId);

      expect(result).toEqual(metadata);
    });
  });
});
