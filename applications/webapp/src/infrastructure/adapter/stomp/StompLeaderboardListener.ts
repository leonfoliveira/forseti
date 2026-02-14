import { LeaderboardListener } from "@/core/port/driven/listener/LeaderboardListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export class StompLeaderboardListener implements LeaderboardListener {
  /**
   * Subscribe to leaderboard updates for a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param cb Callback function to handle received leaderboard submissions.
   */
  async subscribeForLeaderboard(
    client: ListenerClient,
    contestId: string,
    cb: (submission: LeaderboardResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/leaderboard`, cb);
  }

  /**
   * Subscribe to partial leaderboard updates for a contest.
   * A partial leaderboard update contains only a member / problem cell.
   *
   * @param client The listener client used to subscribe to the partial leaderboard.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming partial leaderboard updates.
   */
  async subscribeForLeaderboardPartial(
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: LeaderboardPartialResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/leaderboard/partial`,
      cb,
    );
  }
}
