import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export interface LeaderboardWritter {
  /**
   * Freeze the leaderboard of a contest.
   *
   * @param contestId ID of the contest
   * @return The updated contest with members and problems after freezing the leaderboard
   */
  freeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO>;

  /**
   * Unfreeze the leaderboard of a contest.
   *
   * @param contestId ID of the contest
   * @return The updated contest with members and problems after unfreezing the leaderboard
   */
  unfreeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO>;
}
