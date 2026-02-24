import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosLeaderboardRepository implements LeaderboardRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/leaderboard`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async freeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
    const response =
      await this.axiosClient.put<ContestWithMembersAndProblemsDTO>(
        `${this.basePath(contestId)}:freeze`,
      );
    return response.data;
  }

  async unfreeze(contestId: string): Promise<ContestWithMembersAndProblemsDTO> {
    const response =
      await this.axiosClient.put<ContestWithMembersAndProblemsDTO>(
        `${this.basePath(contestId)}:unfreeze`,
      );
    return response.data;
  }
}
