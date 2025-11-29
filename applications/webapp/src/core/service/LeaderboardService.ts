import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";

export class LeaderboardService {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  findContestLeaderboard(contestId: string) {
    return this.leaderboardRepository.findContestLeaderboard(contestId);
  }
}
