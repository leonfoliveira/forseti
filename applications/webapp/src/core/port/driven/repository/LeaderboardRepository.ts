import { LeaderboardResponseDTO } from "@/core/port/driven/repository/dto/response/leaderboard/LeaderboardResponseDTO";

export type LeaderboardRepository = {
  findContestLeaderboard(contestId: string): Promise<LeaderboardResponseDTO>;
};
