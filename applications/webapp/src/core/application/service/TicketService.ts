import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketRepository } from "@/core/port/driven/repository/TicketRepository";
import { TicketReader } from "@/core/port/driving/usecase/ticket/TicketReader";
import { TicketWritter } from "@/core/port/driving/usecase/ticket/TicketWritter";
import { CreateTicketRequestDTO } from "@/core/port/dto/request/CreateTicketRequestDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

export class TicketService implements TicketReader, TicketWritter {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async create(
    contestId: string,
    inputDTO: CreateTicketRequestDTO,
  ): Promise<TicketResponseDTO> {
    return this.ticketRepository.create(contestId, inputDTO);
  }

  async updateStatus(
    contestId: string,
    ticketId: string,
    status: TicketStatus,
  ): Promise<TicketResponseDTO> {
    return this.ticketRepository.updateStatus(contestId, ticketId, status);
  }

  async findAllByContestId(contestId: string): Promise<TicketResponseDTO[]> {
    return this.ticketRepository.findAllByContestId(contestId);
  }

  async findAllBySignedInMember(
    contestId: string,
  ): Promise<TicketResponseDTO[]> {
    return this.ticketRepository.findAllBySignedInMember(contestId);
  }
}
