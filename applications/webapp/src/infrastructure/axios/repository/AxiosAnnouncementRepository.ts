import { AnnouncementRepository } from "@/port/output/repository/AnnouncementRepository";
import { CreateAnnouncementRequestDTO } from "@/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { AxiosClient } from "@/infrastructure/axios/AxiosClient";

export class AxiosAnnouncementRepository implements AnnouncementRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/announcements`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    request: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO> {
    const response = await this.axiosClient.post<AnnouncementResponseDTO>(
      this.basePath(contestId),
      {
        data: request,
      },
    );
    return response.data;
  }
}
