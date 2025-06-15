import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionFormType = Partial<{
  problemId: string;
  language: Language;
  code: File;
}>;
