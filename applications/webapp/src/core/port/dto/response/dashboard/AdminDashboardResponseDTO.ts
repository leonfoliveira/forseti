import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type AdminDashboardResponseDTO = {
  contest: ContestFullResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullWithExecutionResponseDTO[];
  tickets: TicketResponseDTO[];
};
