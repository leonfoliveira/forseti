import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberWithLoginResponseDTO } from "@/core/port/dto/response/member/MemberWithLoginResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/core/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type AdminDashboardResponseDTO = {
  contest: ContestWithMembersAndProblemsDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberWithLoginResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
  submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
  clarifications: ClarificationResponseDTO[];
  announcements: AnnouncementResponseDTO[];
  tickets: TicketResponseDTO[];
  memberTickets: TicketResponseDTO[];
};
