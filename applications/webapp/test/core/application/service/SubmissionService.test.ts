import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AttachmentService } from "@/core/application/service/AttachmentService";
import { SubmissionService } from "@/core/application/service/SubmissionService";
import { AttachmentContext } from "@/core/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/port/driven/repository/SubmissionRepository";
import { MockCreateSubmissionInputDTO } from "@/test/mock/input/MockCreateSubmissionInputDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeResponseDTO";

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
      const submission = MockSubmissionWithCodeResponseDTO();
      submissionRepository.create.mockResolvedValue(submission);

      const result = await sut.create(contestId, inputDTO);

      expect(result).toEqual(submission);
      expect(attachmentService.upload).toHaveBeenCalledWith(
        contestId,
        AttachmentContext.SUBMISSION_CODE,
        inputDTO.code,
      );
      expect(submissionRepository.create).toHaveBeenCalledWith(contestId, {
        ...inputDTO,
        code: attachment,
      });
    });
  });

  describe("updateAnswer", () => {
    it("should update submission answer", async () => {
      const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
      const submissionId = uuidv4();
      const answer = SubmissionAnswer.ACCEPTED;
      submissionRepository.updateAnswer.mockResolvedValue(submission);

      const result = await sut.updateAnswer(contestId, submissionId, answer);

      expect(result).toEqual(submission);
      expect(submissionRepository.updateAnswer).toHaveBeenCalledWith(
        contestId,
        submissionId,
        answer,
      );
    });
  });

  describe("rerun", () => {
    it("should rerun submission", async () => {
      const submission = MockSubmissionWithCodeAndExecutionsResponseDTO();
      const submissionId = uuidv4();
      submissionRepository.rerun.mockResolvedValue(submission);

      const result = await sut.rerun(contestId, submissionId);

      expect(result).toEqual(submission);
      expect(submissionRepository.rerun).toHaveBeenCalledWith(
        contestId,
        submissionId,
      );
    });
  });
});
