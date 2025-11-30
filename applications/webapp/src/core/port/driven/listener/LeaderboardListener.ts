import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export interface LeaderboardListener {
  /**
   * Subscribe to leaderboard updates for a contest.
   *
   * @param client The listener client used to subscribe to the leaderboard.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming leaderboard updates.
   */
  subscribeForLeaderboard: (
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: LeaderboardResponseDTO) => void,
  ) => Promise<void>;
}
