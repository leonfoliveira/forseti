import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { LeaderboardReader } from "@/core/port/driving/usecase/leaderboard/LeaderboardReader";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export class LeaderboardService implements LeaderboardReader {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  /**
   * Build the leaderboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The constructed leaderboard
   */
  build(contestId: string): Promise<LeaderboardResponseDTO> {
    return this.leaderboardRepository.findContestLeaderboard(contestId);
  }
}
