import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export interface TicketReader {
  /**
   * Finds all tickets for a given contest.
   *
   * @param contestId ID of the contest for which to find tickets.
   * @returns An array of ticket response DTOs associated with the contest.
   */
  findAllByContestId: (contestId: string) => Promise<TicketResponseDTO[]>;

  /**
   * Finds all tickets for the signed-in member in a given contest.
   *
   * @param contestId ID of the contest for which to find tickets.
   * @returns An array of ticket response DTOs associated with the signed-in member.
   */
  findAllBySignedInMember: (contestId: string) => Promise<TicketResponseDTO[]>;
}
