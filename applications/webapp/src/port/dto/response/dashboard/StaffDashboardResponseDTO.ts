import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type StaffDashboardResponseDTO = {
  contest: ContestResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberResponseDTO[];
  problems: ProblemResponseDTO[];
  submissions: SubmissionWithCodeResponseDTO[];
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  printRequests: PrintRequestResponseDTO[];
};
