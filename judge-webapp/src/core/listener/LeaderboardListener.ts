import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

export interface LeaderboardListener {
  subscribeForLeaderboard: (
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: ContestLeaderboardResponseDTO) => void,
  ) => Promise<ListenerClient>;
}
