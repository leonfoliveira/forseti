import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";

export type ContestResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  title: string;
  languages: SubmissionLanguage[];
  startAt: string;
  endAt: string;
  autoFreezeAt?: string;
  settings: {
    isAutoJudgeEnabled: boolean;
  };
  version: number;
};
