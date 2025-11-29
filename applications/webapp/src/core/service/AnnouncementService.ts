import { AnnouncementRepository } from "@/core/port/driven/repository/AnnouncementRepository";
import { CreateAnnouncementRequestDTO } from "@/core/port/dto/request/CreateAnnouncementRequestDTO";

export class AnnouncementService {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async createAnnouncement(
    contestId: string,
    inputDTO: CreateAnnouncementRequestDTO,
  ) {
    return await this.announcementRepository.createAnnouncement(
      contestId,
      inputDTO,
    );
  }
}
