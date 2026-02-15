import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

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

  /**
   * Subscribe to partial leaderboard updates for a contest.
   * A partial leaderboard update contains only a member / problem cell.
   *
   * @param client The listener client used to subscribe to the partial leaderboard.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming partial leaderboard updates.
   */
  subscribeForLeaderboardPartial: (
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: LeaderboardPartialResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to leaderboard freeze events for a contest.
   *
   * @param client The listener client used to subscribe to the leaderboard freeze events.
   * @param contestId ID of the contest
   * @param cb Callback function to handle leaderboard freeze events.
   */
  subscribeForLeaderboardFreeze: (
    client: ListenerClient,
    contestId: string,
    cb: () => void,
  ) => Promise<void>;

  /**
   * Subscribe to leaderboard unfreeze events for a contest.
   *
   * @param client The listener client used to subscribe to the leaderboard unfreeze events.
   * @param contestId ID of the contest
   * @param cb Callback function to handle leaderboard unfreeze events.
   */
  subscribeForLeaderboardUnfreeze: (
    client: ListenerClient,
    contestId: string,
    cb: (data: {
      leaderboard: LeaderboardResponseDTO;
      frozenSubmissions: SubmissionPublicResponseDTO[];
    }) => void,
  ) => Promise<void>;
}
