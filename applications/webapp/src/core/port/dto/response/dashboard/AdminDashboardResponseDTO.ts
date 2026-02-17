import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";

export type AdminDashboardResponseDTO = {
  contest: ContestFullResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullWithExecutionResponseDTO[];
};
