import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type StaffDashboardResponseDTO = {
  contest: ContestPublicResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionPublicResponseDTO[];
  tickets: TicketResponseDTO[];
};
