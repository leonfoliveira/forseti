import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type CreateSubmissionRequestDTO = {
  problemId: string;
  language: SubmissionLanguage;
  code: AttachmentResponseDTO;
};
