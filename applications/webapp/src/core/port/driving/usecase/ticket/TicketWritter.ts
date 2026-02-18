import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { CreateTicketRequestDTO } from "@/core/port/dto/request/CreateTicketRequestDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export interface TicketWritter {
  /**
   * Creates a new ticket for a given contest.
   *
   * @param contestId ID of the contest for which the ticket is being created.
   * @param inputDTO Data transfer object containing the details of the ticket to be created.
   * @returns The created ticket as a response DTO.
   */
  create: (
    contestId: string,
    inputDTO: CreateTicketRequestDTO,
  ) => Promise<TicketResponseDTO>;

  /**
   * Updates the status of an existing ticket for a given contest.
   *
   * @param contestId ID of the contest to which the ticket belongs.
   * @param ticketId ID of the ticket whose status is to be updated.
   * @param status New status to be set for the ticket.
   * @returns The updated ticket as a response DTO.
   */
  updateStatus: (
    contestId: string,
    ticketId: string,
    status: TicketStatus,
  ) => Promise<TicketResponseDTO>;
}
