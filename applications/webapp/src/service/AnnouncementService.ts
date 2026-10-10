import type { AnnouncementWritter } from "@/port/input/usecase/announcement/AnnouncementWritter";
import type { CreateAnnouncementRequestDTO } from "@/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementRepository } from "@/port/output/repository/AnnouncementRepository";

export class AnnouncementService implements AnnouncementWritter {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async create(contestId: string, requestDTO: CreateAnnouncementRequestDTO) {
    return this.announcementRepository.create(contestId, requestDTO);
  }
}
