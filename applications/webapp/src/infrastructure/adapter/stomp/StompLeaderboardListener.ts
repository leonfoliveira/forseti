import { LeaderboardListener } from "@/core/port/driven/listener/LeaderboardListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
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
