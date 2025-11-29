import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export type LeaderboardRepository = {
  findContestLeaderboard(contestId: string): Promise<LeaderboardResponseDTO>;
};
