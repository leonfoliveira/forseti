import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketRepository } from "@/core/port/driven/repository/TicketRepository";
import { CreateTicketRequestDTO } from "@/core/port/dto/request/CreateTicketRequestDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosTicketRepository implements TicketRepository {
  private basePath = (contestId: string) => `/v1/contests/${contestId}/tickets`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    inputDTO: CreateTicketRequestDTO,
  ): Promise<TicketResponseDTO> {
    const response = await this.axiosClient.post<TicketResponseDTO>(
      this.basePath(contestId),
      {
        data: inputDTO,
      },
    );
    return response.data;
  }

  async updateStatus(
    contestId: string,
    ticketId: string,
    status: TicketStatus,
  ): Promise<TicketResponseDTO> {
    const response = await this.axiosClient.put<TicketResponseDTO>(
      `${this.basePath(contestId)}/${ticketId}/status`,
      {
        data: {
          status,
        },
      },
    );
    return response.data;
  }

  async findAllByContestId(contestId: string): Promise<TicketResponseDTO[]> {
    const response = await this.axiosClient.get<TicketResponseDTO[]>(
      this.basePath(contestId),
    );
    return response.data;
  }

  async findAllBySignedInMember(
    contestId: string,
  ): Promise<TicketResponseDTO[]> {
    const response = await this.axiosClient.get<TicketResponseDTO[]>(
      `${this.basePath(contestId)}/members/me`,
    );
    return response.data;
  }
}
