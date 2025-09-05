import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AnnouncementRepository } from "@/core/repository/AnnouncementRepository";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";

export class AxiosAnnouncementRepository implements AnnouncementRepository {
  private basePath = (contestId: string) =>
    `/v1/contests/${contestId}/announcements`;

  constructor(private readonly axiosClient: AxiosClient) {}

  async createAnnouncement(
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
