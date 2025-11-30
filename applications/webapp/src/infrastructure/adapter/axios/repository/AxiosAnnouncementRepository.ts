import { AnnouncementRepository } from "@/core/port/driven/repository/AnnouncementRepository";
import { CreateAnnouncementRequestDTO } from "@/core/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";

export class AxiosAnnouncementRepository implements AnnouncementRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/announcements`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async create(
    contestId: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO> {
    const response = await this.axiosClient.post<AnnouncementResponseDTO>(
      this.basePath(contestId),
      { data: requestDTO },
    );
    return response.data;
  }
}
