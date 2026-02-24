import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export type LeaderboardRepository = {
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
