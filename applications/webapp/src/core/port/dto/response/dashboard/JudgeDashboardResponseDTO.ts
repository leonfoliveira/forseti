import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type JudgeDashboardResponseDTO = {
  contest: ContestPublicResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullWithExecutionResponseDTO[];
  memberTickets: TicketResponseDTO[];
};
