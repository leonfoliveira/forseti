import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export type LeaderboardRepository = {
  /**
   * Builds a leaderboard for a specific contest.
   *
   * @param contestId ID of the contest
   * @returns The contest leaderboard data
   */
  build(contestId: string): Promise<LeaderboardResponseDTO>;

  /**
   * Freezes the leaderboard of a specific contest.
   *
   * @param contestId ID of the contest
   */
  freeze(contestId: string): Promise<void>;

  /**
   * Unfreezes the leaderboard of a specific contest.
   *
   * @param contestId ID of the contest
   */
  unfreeze(contestId: string): Promise<void>;
};
