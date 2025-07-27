import { Language } from "@/core/domain/enumerate/Language";

export type SubmissionForm = Partial<{
  problemId: string;
  language: Language;
  code: File;
}>;
