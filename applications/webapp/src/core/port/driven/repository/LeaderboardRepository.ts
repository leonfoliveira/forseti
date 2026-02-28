import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export type LeaderboardRepository = {
  /**
   * Retrieves the leaderboard of a specific contest.
   * This method bypasses freeze state.
   *
   * @param contestId ID of the contest
   * @return The contest data with members and problems
   */
  get(contestId: string): Promise<LeaderboardResponseDTO>;

  /**
   * Freezes the leaderboard of a specific contest.
   *
   * @param contestId ID of the contest
   * @return The contest data with members and problems after freezing the leaderboard
   */
  freeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO>;

  /**
   * Unfreezes the leaderboard of a specific contest.
   *
   * @param contestId ID of the contest
   * @return The contest data with members and problems after unfreezing the leaderboard
   */
  unfreeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO>;
};
