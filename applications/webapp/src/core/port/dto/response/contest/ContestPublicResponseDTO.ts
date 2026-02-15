import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { MemberPublicResponseDTO } from "@/core/port/dto/response/member/MemberPublicResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";

export type ContestPublicResponseDTO = {
  id: string;
  slug: string;
  title: string;
  languages: SubmissionLanguage[];
  startAt: string;
  endAt: string;
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  problems: ProblemPublicResponseDTO[];
  members: MemberPublicResponseDTO[];
  version: number;
};
