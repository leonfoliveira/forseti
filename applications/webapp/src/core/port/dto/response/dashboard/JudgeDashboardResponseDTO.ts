import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";

export type JudgeDashboardResponseDTO = {
  contest: ContestPublicResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  submissions: SubmissionFullResponseDTO[];
};
