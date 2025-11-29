import { CreateAnnouncementRequestDTO } from "@/core/port/driven/repository/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/port/driven/repository/dto/response/announcement/AnnouncementResponseDTO";

export interface AnnouncementRepository {
  createAnnouncement(
    contestId: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO>;
}
