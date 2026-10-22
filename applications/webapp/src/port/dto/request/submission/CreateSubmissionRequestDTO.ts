import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";

export type CreateSubmissionRequestDTO = {
  problemId: string;
  language: SubmissionLanguage;
  code: AttachmentResponseDTO;
};
