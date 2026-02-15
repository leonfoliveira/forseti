import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { LeaderboardReader } from "@/core/port/driving/usecase/leaderboard/LeaderboardReader";
import { LeaderboardWritter } from "@/core/port/driving/usecase/leaderboard/LeaderboardWritter";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export class LeaderboardService
  implements LeaderboardReader, LeaderboardWritter
{
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  /**
   * Build the leaderboard for a contest.
   *
   * @param contestId ID of the contest
   * @return The constructed leaderboard
   */
  build(contestId: string): Promise<LeaderboardResponseDTO> {
    return this.leaderboardRepository.build(contestId);
  }

  /**
   * Freeze the leaderboard of a contest.
   *
   * @param contestId ID of the contest
   */
  freeze(contestId: string): Promise<void> {
    return this.leaderboardRepository.freeze(contestId);
  }

  /**
   * Unfreeze the leaderboard of a contest.
   *
   * @param contestId ID of the contest
   */
  unfreeze(contestId: string): Promise<void> {
    return this.leaderboardRepository.unfreeze(contestId);
  }
}
