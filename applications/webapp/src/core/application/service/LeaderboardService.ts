import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { LeaderboardWritter } from "@/core/port/driving/usecase/leaderboard/LeaderboardWritter";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export class LeaderboardService implements LeaderboardWritter {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  freeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
    return this.leaderboardRepository.freeze(contestId);
  }

  unfreeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
    return this.leaderboardRepository.unfreeze(contestId);
  }
}
