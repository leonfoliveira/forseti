import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";

export interface StaffDashboardRoomListener {
  /**
   * Subscribes to the staff dashboard room for the specified contest.
   *
   * @param contestId The ID of the contest to subscribe to.
   * @param listeners An object containing the event listeners.
   * @param onDisconnect An optional callback invoked when the connection is disconnected.
   * @param onReconnect An optional callback invoked when the connection is reestablished.
   * @returns A promise that resolves when the subscription is successful.
   */
  subscribe(
    contestId: string,
    listeners: {
      LEADERBOARD_UPDATED: (
        leaderboardCell: LeaderboardCellResponseDTO,
      ) => void;
      SUBMISSION_CREATED: (submission: SubmissionWithCodeResponseDTO) => void;
      SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
      ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
      CLARIFICATION_PUBLISHED: (
        clarification: ClarificationResponseDTO,
      ) => void;
      CONTEST_FROZEN: (contest: ContestResponseDTO) => void;
      CONTEST_UNFROZEN: (data: {
        contest: ContestResponseDTO;
        leaderboard: LeaderboardResponseDTO;
        submissions: SubmissionWithCodeResponseDTO[];
      }) => void;
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void>;

  /**
   * Unsubscribes from the staff dashboard room.
   *
   * @returns A promise that resolves when the unsubscription is successful.
   */
  unsubscribe(): Promise<void>;
}
