import { Language } from "@/core/domain/enumerate/Language";
import { Attachment } from "@/core/domain/model/Attachment";

export type CreateSubmissionRequestDTO = {
  problemId: string;
  language: Language;
  code: Attachment;
};
