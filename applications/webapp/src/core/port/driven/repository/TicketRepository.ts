import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { CreateTicketRequestDTO } from "@/core/port/dto/request/CreateTicketRequestDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export interface TicketRepository {
  /**
   * Creates a new ticket for a given contest.
   *
   * @param contestId ID of the contest for which the ticket is being created.
   * @param inputDTO Data transfer object containing the details of the ticket to be created.
   * @return The created ticket as a response DTO.
   */
  create(
    contestId: string,
    inputDTO: CreateTicketRequestDTO,
  ): Promise<TicketResponseDTO>;

  /**
   * Updates the status of an existing ticket for a given contest.
   *
   * @param contestId ID of the contest to which the ticket belongs.
   * @param ticketId ID of the ticket whose status is to be updated.
   * @param status New status to be set for the ticket.
   * @return The updated ticket as a response DTO.
   */
  updateStatus(
    contestId: string,
    ticketId: string,
    status: TicketStatus,
  ): Promise<TicketResponseDTO>;

  /**
   * Finds all tickets associated with a given contest.
   *
   * @param contestId ID of the contest for which to find tickets.
   * @return An array of ticket response DTOs associated with the contest.
   */
  findAllByContest(contestId: string): Promise<TicketResponseDTO[]>;

  /**
   * Finds all tickets associated with a member in a contest.
   *
   * @param contestId ID of the contest for which to find tickets.
   * @return An array of ticket response DTOs associated with the member in the contest.
   */
  findAllBySignedInMember(contestId: string): Promise<TicketResponseDTO[]>;
}
