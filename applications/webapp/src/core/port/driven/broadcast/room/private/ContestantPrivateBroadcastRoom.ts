import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type ContestantPrivateBroadcastRoomCallbacks = {
  CLARIFICATION_ANSWERED: (clarification: ClarificationResponseDTO) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  TICKET_UPDATED: (ticket: TicketResponseDTO) => void;
};

export class ContestantPrivateBroadcastRoom extends BroadcastRoom<ContestantPrivateBroadcastRoomCallbacks> {
  constructor(
    memberId: string,
    public callbacks: ContestantPrivateBroadcastRoomCallbacks,
  ) {
    super(`/members/${memberId}/private/contestant`, callbacks);
  }
}
