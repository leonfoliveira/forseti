import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { LeaderboardResponseDTO } from "@/core/port/driven/repository/dto/response/leaderboard/LeaderboardResponseDTO";
import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";

export class AxiosLeaderboardRepository implements LeaderboardRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/leaderboard`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async findContestLeaderboard(
    contestId: string,
  ): Promise<LeaderboardResponseDTO> {
    const result = await this.axiosClient.get<LeaderboardResponseDTO>(
      this.basePath(contestId),
    );
    return result.data;
  }
}
