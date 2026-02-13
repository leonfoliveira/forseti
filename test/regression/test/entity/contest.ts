import { SubmissionLanguage } from "@/test/entity/submission";

export type Contest = {
  slug: string;
  title: string;
  status: ContestStatus;
  startAt: string;
  endAt: string;
  languages: SubmissionLanguage[];
};

export enum ContestStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  ENDED = "Ended",
}
