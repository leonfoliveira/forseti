import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export interface MemberPrivateRoomListener {
  /**
   * Subscribes to the member private room for the specified contest.
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
      SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
      CLARIFICATION_ANSWERED: (clarification: ClarificationResponseDTO) => void;
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void>;

  /**
   * Unsubscribes from the member private room.
   *
   * @returns A promise that resolves when the unsubscription is successful.
   */
  unsubscribe(): Promise<void>;
}
