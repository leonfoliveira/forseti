import { StompConnector } from "@/adapter/stomp/StompConnector";
import { StompClient } from "@/adapter/stomp/StompClient";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { LeaderboardListener } from "@/core/listener/LeaderboardListener";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export class StompLeaderboardListener implements LeaderboardListener {
  constructor(private readonly stompConnector: StompConnector) {}

  async subscribeForLeaderboard(
    contestId: string,
    cb: (submission: ContestLeaderboardResponseDTO) => void,
  ): Promise<ListenerClient> {
    const client = new StompClient(this.stompConnector);
    await client.subscribe(`/topic/contests/${contestId}/leaderboard`, cb);
    return client;
  }
}
