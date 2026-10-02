import { AttachmentContext } from "@/domain/enumerate/AttachmentContext";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { SubmissionService } from "@/service/SubmissionService";
import {
  MockAttachmentResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("SubmissionService", () => {
  it("uploads submitted code and creates a submission using its attachment", async () => {
    const file = new File(["source"], "main.cpp", { type: "text/plain" });
    const attachment = MockAttachmentResponseDTO({ id: "code-upload" });
    const submission = MockSubmissionWithCodeResponseDTO();
    const attachmentService = { upload: jest.fn().mockResolvedValue(attachment) };
    const repository = {
      create: jest.fn().mockResolvedValue(submission),
      updateAnswer: jest.fn(),
      resubmit: jest.fn(),
    };
    const service = new SubmissionService(repository, attachmentService as never);
    const input = {
      problemId: "problem-7",
      language: SubmissionLanguage.CPP_17,
      code: file,
    };

    await expect(service.create("contest-42", input)).resolves.toBe(submission);
    expect(attachmentService.upload).toHaveBeenCalledWith(
      "contest-42",
      AttachmentContext.SUBMISSION_CODE,
      file,
    );
    expect(repository.create).toHaveBeenCalledWith("contest-42", {
      ...input,
      code: attachment,
    });
  });

  it("delegates answer updates and resubmission", async () => {
    const submission = MockSubmissionWithCodeResponseDTO();
    const repository = {
      create: jest.fn(),
      updateAnswer: jest.fn().mockResolvedValue(submission),
      resubmit: jest.fn().mockResolvedValue(submission),
    };
    const service = new SubmissionService(repository, { upload: jest.fn() } as never);

    await expect(
      service.updateAnswer(
        "contest-42",
        "submission-7",
        SubmissionAnswer.WRONG_ANSWER,
      ),
    ).resolves.toBe(submission);
    await expect(
      service.resubmit("contest-42", "submission-7"),
    ).resolves.toBe(submission);
    expect(repository.updateAnswer).toHaveBeenCalledWith(
      "contest-42",
      "submission-7",
      SubmissionAnswer.WRONG_ANSWER,
    );
    expect(repository.resubmit).toHaveBeenCalledWith(
      "contest-42",
      "submission-7",
    );
  });
});
