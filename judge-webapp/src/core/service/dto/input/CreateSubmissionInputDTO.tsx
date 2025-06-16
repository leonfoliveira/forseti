import { Language } from "@/core/domain/enumerate/Language";

export type CreateSubmissionInputDTO = {
  language: Language;
  code: File;
};
