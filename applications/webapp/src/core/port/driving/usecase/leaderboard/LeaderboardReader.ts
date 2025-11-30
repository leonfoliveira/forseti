import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export interface LeaderboardReader {
  /**
   * Build the leaderboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The constructed leaderboard
   */
  build(contestId: string): Promise<LeaderboardResponseDTO>;
}
