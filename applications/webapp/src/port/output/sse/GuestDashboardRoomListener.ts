import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export interface GuestDashboardRoomListener {
  /**
   * Subscribes to the guest dashboard room for the specified contest.
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
      SUBMISSION_CREATED: (submission: SubmissionResponseDTO) => void;
      SUBMISSION_UPDATED: (submission: SubmissionResponseDTO) => void;
      ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
      CLARIFICATION_PUBLISHED: (
        clarification: ClarificationResponseDTO,
      ) => void;
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void>;

  /**
   * Unsubscribes from the guest dashboard room.
   *
   * @returns A promise that resolves when the unsubscription is successful.
   */
  unsubscribe(): Promise<void>;
}
