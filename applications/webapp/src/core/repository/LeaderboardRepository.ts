import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";

export type LeaderboardRepository = {
  findContestLeaderboard(contestId: string): Promise<LeaderboardResponseDTO>;
};
