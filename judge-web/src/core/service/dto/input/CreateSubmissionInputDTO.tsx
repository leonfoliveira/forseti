import { Language } from "@/core/domain/enumerate/Language";

export type CreateSubmissionInputDTO = {
  problemId: number;
  language: Language;
  code: File;
};
