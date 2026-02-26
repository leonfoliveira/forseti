import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export type JudgePrivateBroadcastRoomCallbacks = {
  TICKET_UPDATED: (ticket: TicketResponseDTO) => void;
};

export class JudgePrivateBroadcastRoom extends BroadcastRoom<JudgePrivateBroadcastRoomCallbacks> {
  constructor(
    contestId: string,
    memberId: string,
    public callbacks: JudgePrivateBroadcastRoomCallbacks,
  ) {
    super(
      `/contests/${contestId}/members/${memberId}/private/judge`,
      callbacks,
    );
  }
}
