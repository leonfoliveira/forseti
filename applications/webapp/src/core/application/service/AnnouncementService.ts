import { AnnouncementRepository } from "@/core/port/driven/repository/AnnouncementRepository";
import { AnnouncementWritter } from "@/core/port/driving/usecase/announcement/AnnouncementWritter";
import { CreateAnnouncementRequestDTO } from "@/core/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export class AnnouncementService implements AnnouncementWritter {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async create(
    contestId: string,
    inputDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO> {
    return await this.announcementRepository.create(contestId, inputDTO);
  }
}
