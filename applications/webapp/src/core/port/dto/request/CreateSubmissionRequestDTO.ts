import { Language } from "@/core/domain/enumerate/Language";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type CreateSubmissionRequestDTO = {
  problemId: string;
  language: Language;
  code: AttachmentResponseDTO;
};
