import { Language } from "@/core/domain/enumerate/Language";

export type CreateSubmissionInputDTO = {
  problemId: string;
  language: Language;
  code: File;
};
