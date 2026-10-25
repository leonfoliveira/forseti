import type { AnnouncementWriter } from "@/port/input/usecase/announcement/AnnouncementWriter";
import type { CreateAnnouncementRequestDTO } from "@/port/dto/request/announcement/CreateAnnouncementRequestDTO";
import { AnnouncementRepository } from "@/port/output/repository/AnnouncementRepository";

export class AnnouncementService implements AnnouncementWriter {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async create(contestId: string, requestDTO: CreateAnnouncementRequestDTO) {
    return this.announcementRepository.create(contestId, requestDTO);
  }
}
