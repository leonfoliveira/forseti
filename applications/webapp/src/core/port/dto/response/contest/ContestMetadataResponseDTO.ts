import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";

export type ContestMetadataResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: SubmissionLanguage[];
  startAt: string;
  endAt: string;
};
