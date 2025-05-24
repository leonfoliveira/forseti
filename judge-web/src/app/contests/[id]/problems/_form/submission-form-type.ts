import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionFormType = Partial<{
  language: Language;
  code: File;
}>;
