import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export type LeaderboardRepository = {
  /**
   * Builds a leaderboard for a specific contest.
   *
   * @param contestId ID of the contest
   * @returns The contest leaderboard data
   */
  build(contestId: string): Promise<LeaderboardResponseDTO>;
};
