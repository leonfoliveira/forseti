import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionFormType = Partial<{
  problemId: number;
  language: Language;
  code: File;
}>;
