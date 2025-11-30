import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AttachmentService } from "@/core/application/service/AttachmentService";
import { ContestService } from "@/core/application/service/ContestService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { MockUpdateContestInputDTO } from "@/test/mock/input/MockUpdateContestInputDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";

describe("ClarificationService", () => {
  const contestRepository = mock<ContestRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new ContestService(contestRepository, attachmentService);

  const contestId = uuidv4();

  describe("update", () => {
    it("should update a contest without upload files", async () => {
      const inputDTO = MockUpdateContestInputDTO();
      inputDTO.problems[0].newDescription = undefined;
      inputDTO.problems[0].newTestCases = undefined;

      await sut.update(inputDTO);

      expect(attachmentService.upload).not.toHaveBeenCalled();
      expect(contestRepository.update).toHaveBeenCalledWith(inputDTO);
    });

    it("should update a contest with upload files", async () => {
      const inputDTO = MockUpdateContestInputDTO();
      const attachment = MockAttachmentResponseDTO();
      attachmentService.upload.mockResolvedValue(attachment);

      await sut.update(inputDTO);

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
      expect(contestRepository.update).toHaveBeenCalledWith({
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

  describe("findMetadataBySlug", () => {
    it("should find contest metadata by slug", async () => {
      const metadata = MockContestMetadataResponseDTO();
      contestRepository.findMetadataBySlug.mockResolvedValue(metadata);

      const result = await sut.findMetadataBySlug("contest-slug");

      expect(result).toEqual(metadata);
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
