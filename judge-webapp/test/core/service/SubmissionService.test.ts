import { randomUUID } from "crypto";

import { mock } from "jest-mock-extended";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionRepository } from "@/core/repository/SubmissionRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { SubmissionService } from "@/core/service/SubmissionService";
import { MockCreateSubmissionInputDTO } from "@/test/mock/input/MockCreateSubmissionInputDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";

describe("SubmissionService", () => {
  const submissionRepository = mock<SubmissionRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new SubmissionService(submissionRepository, attachmentService);

  const contestId = randomUUID();

  describe("createSubmission", () => {
    it("should create a new submission", async () => {
      const inputDTO = MockCreateSubmissionInputDTO();
      const attachment = MockAttachment();
      attachmentService.upload.mockResolvedValue(attachment);
      const submission = MockSubmissionFullResponseDTO();
      submissionRepository.createSubmission.mockResolvedValue(submission);

      const result = await sut.createSubmission(contestId, inputDTO);

      expect(result).toEqual(submission);
      expect(submissionRepository.createSubmission).toHaveBeenCalledWith(
        contestId,
        {
          ...inputDTO,
          code: attachment,
        },
      );
    });
  });

  describe("findAllContestSubmissions", () => {
    it("should return all submissions for the contest", async () => {
      const submissions = [
        MockSubmissionPublicResponseDTO(),
        MockSubmissionPublicResponseDTO(),
      ];
      submissionRepository.findAllContestSubmissions.mockResolvedValue(
        submissions,
      );

      const result = await sut.findAllContestSubmissions(contestId);

      expect(result).toEqual(submissions);
    });
  });

  describe("findAllContestFullSubmissions", () => {
    it("should return all full submissions for the contest", async () => {
      const submissions = [
        MockSubmissionFullResponseDTO(),
        MockSubmissionFullResponseDTO(),
      ];
      submissionRepository.findAllContestFullSubmissions.mockResolvedValue(
        submissions,
      );

      const result = await sut.findAllContestFullSubmissions(contestId);
      expect(result).toEqual(submissions);
    });
  });

  describe("findAllFullForMember", () => {
    it("should return all full submissions for member", async () => {
      const submissions = [
        MockSubmissionFullResponseDTO(),
        MockSubmissionFullResponseDTO(),
      ];
      submissionRepository.findAllFullForMember.mockResolvedValue(submissions);

      const result = await sut.findAllFullForMember(contestId);

      expect(result).toEqual(submissions);
    });
  });

  describe("updateSubmissionAnswer", () => {
    it("should update submission answer", async () => {
      const submissionId = randomUUID();
      const answer = SubmissionAnswer.ACCEPTED;

      await sut.updateSubmissionAnswer(contestId, submissionId, answer);

      expect(submissionRepository.updateSubmissionAnswer).toHaveBeenCalledWith(
        contestId,
        submissionId,
        answer,
      );
    });
  });

  describe("rerunSubmission", () => {
    it("should rerun submission", async () => {
      const submissionId = randomUUID();

      await sut.rerunSubmission(contestId, submissionId);

      expect(submissionRepository.rerunSubmission).toHaveBeenCalledWith(
        contestId,
        submissionId,
      );
    });
  });
});
