import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionFormType = {
  problemId: string;
  language: Language;
  code: File[];
};
