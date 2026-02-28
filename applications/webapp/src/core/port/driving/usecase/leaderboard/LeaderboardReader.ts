import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export interface LeaderboardReader {
  /**
   * Get the leaderboard of a contest.
   * This method bypasses freeeze state.
   *
   * @param contestId ID of the contest
   * @return The leaderboard response containing the ranking and other related information
   */
  get(contestId: string): Promise<LeaderboardResponseDTO>;
}
