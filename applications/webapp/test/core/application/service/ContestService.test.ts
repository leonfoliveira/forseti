import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AttachmentService } from "@/core/application/service/AttachmentService";
import { ContestService } from "@/core/application/service/ContestService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { ContestRepository } from "@/core/port/driven/repository/ContestRepository";
import { MockUpdateContestInputDTO } from "@/test/mock/input/MockUpdateContestInputDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/contest/MockContestWithMembersAndProblemsDTO";

describe("ClarificationService", () => {
  const contestRepository = mock<ContestRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new ContestService(contestRepository, attachmentService);

  const contestId = uuidv4();

  describe("update", () => {
    it("should update a contest without upload files", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      const inputDTO = MockUpdateContestInputDTO();
      inputDTO.problems[0].newDescription = undefined;
      inputDTO.problems[0].newTestCases = undefined;
      contestRepository.update.mockResolvedValue(contest);

      const result = await sut.update(contestId, inputDTO);

      expect(result).toEqual(contest);
      expect(attachmentService.upload).not.toHaveBeenCalled();
      expect(contestRepository.update).toHaveBeenCalledWith(
        contestId,
        inputDTO,
      );
    });

    it("should update a contest with upload files", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      const inputDTO = MockUpdateContestInputDTO();
      const attachment = MockAttachmentResponseDTO();
      attachmentService.upload.mockResolvedValue(attachment);
      contestRepository.update.mockResolvedValue(contest);

      const result = await sut.update(contestId, inputDTO);

      expect(result).toEqual(contest);
      expect(attachmentService.upload).toHaveBeenCalledWith(
        contestId,
        AttachmentContext.PROBLEM_DESCRIPTION,
        inputDTO.problems[0].newDescription,
      );
      expect(attachmentService.upload).toHaveBeenCalledWith(
        contestId,
        AttachmentContext.PROBLEM_TEST_CASES,
        inputDTO.problems[0].newTestCases,
      );
      expect(contestRepository.update).toHaveBeenCalledWith(contestId, {
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

  describe("findBySlug", () => {
    it("should find contest metadata by slug", async () => {
      const contest = MockContestResponseDTO();
      contestRepository.findBySlug.mockResolvedValue(contest);

      const result = await sut.findBySlug("contest-slug");

      expect(result).toEqual(contest);
    });
  });

  describe("forceStart", () => {
    it("should force start a contest", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      contestRepository.forceStart.mockResolvedValue(contest);

      const result = await sut.forceStart(contestId);

      expect(result).toEqual(contest);
    });
  });

  describe("forceEnd", () => {
    it("should force end a contest", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      contestRepository.forceEnd.mockResolvedValue(contest);

      const result = await sut.forceEnd(contestId);

      expect(result).toEqual(contest);
    });
  });
});
