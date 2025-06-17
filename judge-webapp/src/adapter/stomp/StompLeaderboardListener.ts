import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { LeaderboardListener } from "@/core/listener/LeaderboardListener";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export class StompLeaderboardListener implements LeaderboardListener {
  async subscribeForLeaderboard(
    client: ListenerClient,
    contestId: string,
    cb: (submission: ContestLeaderboardResponseDTO) => void,
  ): Promise<ListenerClient> {
    await client.subscribe(`/topic/contests/${contestId}/leaderboard`, cb);
    return client;
  }
}
