export interface LeaderboardWritter {
  /**
   * Freeze the leaderboard of a contest.
   *
   * @param contestId ID of the contest
   */
  freeze(contestId: string): Promise<void>;

  /**
   * Unfreeze the leaderboard of a contest.
   *
   * @param contestId ID of the contest
   */
  unfreeze(contestId: string): Promise<void>;
}
