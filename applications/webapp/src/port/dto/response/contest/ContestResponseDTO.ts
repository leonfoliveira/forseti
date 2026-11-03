import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";

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
  frozenAt?: string;
  ipCIDRs: string[];
  settings: {
    isAutoJudgeEnabled: boolean;
    isClarificationEnabled: boolean;
    isPrintRequestEnabled: boolean;
    isSpectatorEnabled: boolean;
  };
  version: number;
};
