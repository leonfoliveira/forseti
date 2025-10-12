import { LeaderboardRepository } from "@/core/repository/LeaderboardRepository";

export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  findContestLeaderboard(contestId: string) {
    return this.leaderboardRepository.findContestLeaderboard(contestId);
  }
}
