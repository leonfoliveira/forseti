import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { MemberFullResponseDTO } from "@/core/port/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/port/dto/response/problem/ProblemFullResponseDTO";

export type ContestFullResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: SubmissionLanguage[];
  startAt: string;
  endAt: string;
  autoFreezeAt?: string;
  settings: {
    isAutoJudgeEnabled: boolean;
  };
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  members: MemberFullResponseDTO[];
  problems: ProblemFullResponseDTO[];
};
