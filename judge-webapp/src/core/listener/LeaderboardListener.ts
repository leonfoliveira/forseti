import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";

export interface LeaderboardListener {
  subscribeForLeaderboard: (
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: LeaderboardResponseDTO) => void,
  ) => Promise<void>;
}
