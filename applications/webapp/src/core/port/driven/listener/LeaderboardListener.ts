import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";

export interface LeaderboardListener {
  /**
   * Subscribe to leaderboard cell updates for a contest.
   * A leaderboard cell update contains only a member / problem cell.
   *
   * @param client The listener client used to subscribe to the leaderboard cell updates.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming leaderboard cell updates.
   */
  subscribeForLeaderboardCell: (
    client: ListenerClient,
    contestId: string,
    cb: (leaderboard: LeaderboardCellResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to leaderboard frozen events for a contest.
   *
   * @param client The listener client used to subscribe to the leaderboard frozen events.
   * @param contestId ID of the contest
   * @param cb Callback function to handle leaderboard frozen events.
   */
  subscribeForLeaderboardFrozen: (
    client: ListenerClient,
    contestId: string,
    cb: () => void,
  ) => Promise<void>;

  /**
   * Subscribe to leaderboard unfrozen events for a contest.
   *
   * @param client The listener client used to subscribe to the leaderboard unfrozen events.
   * @param contestId ID of the contest
   * @param cb Callback function to handle leaderboard unfrozen events.
   */
  subscribeForLeaderboardUnfrozen: (
    client: ListenerClient,
    contestId: string,
    cb: (data: {
      leaderboard: LeaderboardResponseDTO;
      frozenSubmissions: SubmissionResponseDTO[];
    }) => void,
  ) => Promise<void>;
}
