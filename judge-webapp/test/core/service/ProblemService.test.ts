import { mock } from "jest-mock-extended";

import { Language } from "@/core/domain/enumerate/Language";
import { Attachment } from "@/core/domain/model/Attachment";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ProblemRepository } from "@/core/repository/ProblemRepository";
import { AttachmentService } from "@/core/service/AttachmentService";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { ProblemService } from "@/core/service/ProblemService";

describe("ProblemService", () => {
  const problemRepository = mock<ProblemRepository>();
  const attachmentService = mock<AttachmentService>();

  const sut = new ProblemService(problemRepository, attachmentService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSubmission", () => {
    it("should create a submission with the given id and input", async () => {
      const id = "problem-id";
      const input: CreateSubmissionInputDTO = {
        language: Language.PYTHON_3_13,
        code: new File(["print('Hello, World!')"], "hello.py"),
      };
      const attachment = { id: "attachment-id" } as unknown as Attachment;
      attachmentService.upload.mockResolvedValue(attachment);
      const submission = {
        id: "submission-id",
      } as unknown as SubmissionFullResponseDTO;
      problemRepository.createSubmission.mockResolvedValue(submission);

      const result = await sut.createSubmission(id, input);

      expect(attachmentService.upload).toHaveBeenCalledWith(input.code);
      expect(problemRepository.createSubmission).toHaveBeenCalledWith(id, {
        language: input.language,
        code: attachment,
      });
      expect(result).toEqual(submission);
    });
  });
});
