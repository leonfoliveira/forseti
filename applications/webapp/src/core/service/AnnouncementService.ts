import { AnnouncementRepository } from "@/core/repository/AnnouncementRepository";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";

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
