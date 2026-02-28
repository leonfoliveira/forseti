import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { LeaderboardReader } from "@/core/port/driving/usecase/leaderboard/LeaderboardReader";
import { LeaderboardWritter } from "@/core/port/driving/usecase/leaderboard/LeaderboardWritter";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";

export class LeaderboardService
  implements LeaderboardReader, LeaderboardWritter
{
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  get(contestId: string) {
    return this.leaderboardRepository.get(contestId);
  }

  freeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
    return this.leaderboardRepository.freeze(contestId);
  }

  unfreeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
    return this.leaderboardRepository.unfreeze(contestId);
  }
}
