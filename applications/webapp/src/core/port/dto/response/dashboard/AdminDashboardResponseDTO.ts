import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";

export type AdminDashboardResponseDTO = {
  contest: ContestFullResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullResponseDTO[];
};
