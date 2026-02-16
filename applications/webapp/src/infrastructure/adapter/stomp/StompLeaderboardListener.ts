import { LeaderboardListener } from "@/core/port/driven/listener/LeaderboardListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

export class StompLeaderboardListener implements LeaderboardListener {
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

  async subscribeForLeaderboardFreeze(
    client: ListenerClient,
    contestId: string,
    cb: () => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/leaderboard/freeze`,
      cb,
    );
  }

  async subscribeForLeaderboardUnfreeze(
    client: ListenerClient,
    contestId: string,
    cb: (data: {
      leaderboard: LeaderboardResponseDTO;
      frozenSubmissions: SubmissionPublicResponseDTO[];
    }) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/leaderboard/unfreeze`,
      cb,
    );
  }
}
