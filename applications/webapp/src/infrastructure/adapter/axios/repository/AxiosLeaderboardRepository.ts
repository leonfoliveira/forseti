import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosLeaderboardRepository implements LeaderboardRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/leaderboard`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async build(contestId: string): Promise<LeaderboardResponseDTO> {
    const result = await this.axiosClient.get<LeaderboardResponseDTO>(
      this.basePath(contestId),
    );
    return result.data;
  }

  async freeze(contestId: string): Promise<void> {
    await this.axiosClient.post(`${this.basePath(contestId)}/freeze`);
  }

  async unfreeze(contestId: string): Promise<void> {
    await this.axiosClient.post(`${this.basePath(contestId)}/unfreeze`);
  }
}
