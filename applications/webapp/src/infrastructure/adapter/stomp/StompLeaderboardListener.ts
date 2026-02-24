import { LeaderboardListener } from "@/core/port/driven/listener/LeaderboardListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";

export class StompLeaderboardListener implements LeaderboardListener {
  /**
   * Subscribe to partial leaderboard updates for a contest.
   * A partial leaderboard update contains only a member / problem cell.
   *
   * @param client The listener client used to subscribe to the partial leaderboard.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming partial leaderboard updates.
   */
  async subscribeForLeaderboardCell(
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: LeaderboardCellResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/leaderboard:cell`, cb);
  }

  async subscribeForLeaderboardFrozen(
    client: ListenerClient,
    contestId: string,
    cb: () => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/leaderboard:frozen`,
      cb,
    );
  }

  async subscribeForLeaderboardUnfrozen(
    client: ListenerClient,
    contestId: string,
    cb: (data: {
      leaderboard: LeaderboardResponseDTO;
      frozenSubmissions: SubmissionResponseDTO[];
    }) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/leaderboard:unfrozen`,
      cb,
    );
  }
}
