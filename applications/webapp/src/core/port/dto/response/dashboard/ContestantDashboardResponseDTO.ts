import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type ContestantDashboardResponseDTO = {
  contest: ContestPublicResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionPublicResponseDTO[];
  memberSubmissions: SubmissionFullResponseDTO[];
  memberTickets: TicketResponseDTO[];
};
