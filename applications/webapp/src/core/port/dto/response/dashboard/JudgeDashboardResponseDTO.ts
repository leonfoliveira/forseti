import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/core/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type JudgeDashboardResponseDTO = {
  contest: ContestResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
  submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  announcements: AnnouncementResponseDTO[];
  memberTickets: TicketResponseDTO[];
};
