import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AttachmentService } from "@/core/application/service/AttachmentService";
import { SubmissionService } from "@/core/application/service/SubmissionService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { MockCreateSubmissionInputDTO } from "@/test/mock/input/MockCreateSubmissionInputDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";

describe("SubmissionService", () => {
  const submissionRepository = mock<SubmissionRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new SubmissionService(submissionRepository, attachmentService);

  const contestId = uuidv4();

  describe("create", () => {
    it("should create a new submission", async () => {
      const inputDTO = MockCreateSubmissionInputDTO();
      const attachment = MockAttachmentResponseDTO();
      attachmentService.upload.mockResolvedValue(attachment);
      const submission = MockSubmissionFullResponseDTO();
      submissionRepository.createSubmission.mockResolvedValue(submission);

      const result = await sut.create(contestId, inputDTO);

      expect(result).toEqual(submission);
      expect(attachmentService.upload).toHaveBeenCalledWith(
        contestId,
        AttachmentContext.SUBMISSION_CODE,
        inputDTO.code,
      );
      expect(submissionRepository.createSubmission).toHaveBeenCalledWith(
        contestId,
        {
          ...inputDTO,
          code: attachment,
        },
      );
    });
  });

  describe("updateAnswer", () => {
    it("should update submission answer", async () => {
      const submissionId = uuidv4();
      const answer = SubmissionAnswer.ACCEPTED;

      await sut.updateAnswer(contestId, submissionId, answer);

      expect(submissionRepository.updateSubmissionAnswer).toHaveBeenCalledWith(
        contestId,
        submissionId,
        answer,
      );
    });
  });

  describe("rerun", () => {
    it("should rerun submission", async () => {
      const submissionId = uuidv4();

      await sut.rerun(contestId, submissionId);

      expect(submissionRepository.rerunSubmission).toHaveBeenCalledWith(
        contestId,
        submissionId,
      );
    });
  });
});
