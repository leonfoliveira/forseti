import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { LeaderboardListener } from "@/core/listener/LeaderboardListener";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export class StompLeaderboardListener implements LeaderboardListener {
  async subscribeForLeaderboard(
    client: ListenerClient,
    contestId: string,
    cb: (submission: LeaderboardResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/leaderboard`, cb);
  }
}
