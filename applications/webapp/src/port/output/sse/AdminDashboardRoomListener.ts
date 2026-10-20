import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";

export interface AdminDashboardRoomListener {
  /**
   * Subscribes to the admin dashboard room for the specified contest.
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
      SUBMISSION_CREATED: (
        submission: SubmissionWithCodeAndExecutionsResponseDTO,
      ) => void;
      SUBMISSION_UPDATED: (
        submission: SubmissionWithCodeAndExecutionsResponseDTO,
      ) => void;
      ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
      CLARIFICATION_CREATED: (clarification: ClarificationResponseDTO) => void;
      CLARIFICATION_ANSWERED: (clarification: ClarificationResponseDTO) => void;
      CLARIFICATION_PUBLISHED: (
        clarification: ClarificationResponseDTO,
      ) => void;
      CONTEST_FROZEN: (
        contest: ContestWithMembersAndProblemsResponseDTO,
      ) => void;
      CONTEST_UNFROZEN: (data: {
        contest: ContestWithMembersAndProblemsResponseDTO;
        leaderboard: LeaderboardResponseDTO;
        submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
      }) => void;
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void>;

  /**
   * Unsubscribes from the admin dashboard room.
   *
   * @returns A promise that resolves when the unsubscription is successful.
   */
  unsubscribe(): Promise<void>;
}
