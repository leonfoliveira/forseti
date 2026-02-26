import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";

export type GuestDashboardResponseDTO = {
  contest: ContestResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberResponseDTO[];
  problems: ProblemResponseDTO[];
  submissions: SubmissionResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  announcements: AnnouncementResponseDTO[];
};
