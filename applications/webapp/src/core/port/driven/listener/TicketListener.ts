import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export interface TicketListener {
  /**
   * Subscribe to ticket updates for a contest.
   *
   * @param client The listener client used to subscribe to the tickets.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming tickets.
   */
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (ticket: TicketResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to ticket updates for a member in a contest.
   *
   * @param client The listener client used to subscribe to the tickets.
   * @param contestId ID of the contest
   * @param memberId ID of the member
   * @param cb Callback function to handle incoming tickets.
   */
  subscribeForMember: (
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (ticket: TicketResponseDTO) => void,
  ) => Promise<void>;
}
