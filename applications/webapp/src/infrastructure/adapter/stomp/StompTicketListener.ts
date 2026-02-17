import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { TicketListener } from "@/core/port/driven/listener/TicketListener";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export class StompTicketListener implements TicketListener {
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (ticket: TicketResponseDTO) => void,
  ): Promise<void> {
    client.subscribe(`/topic/contests/${contestId}/tickets`, cb);
  }

  async subscribeForMember(
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (ticket: TicketResponseDTO) => void,
  ): Promise<void> {
    client.subscribe(
      `/topic/contests/${contestId}/tickets/members/${memberId}`,
      cb,
    );
  }
}
