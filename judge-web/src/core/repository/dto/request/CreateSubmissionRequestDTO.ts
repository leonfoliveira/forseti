import { Language } from "@/core/domain/enumerate/Language";
import { AttachmentRequestDTO } from "@/core/repository/dto/request/AttachmentRequestDTO";

export type CreateSubmissionRequestDTO = {
  language: Language;
  code: AttachmentRequestDTO;
};
