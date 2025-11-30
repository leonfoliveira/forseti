import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";

export type SubmissionFormType = {
  problemId: string;
  language: SubmissionLanguage;
  code: File[];
};
