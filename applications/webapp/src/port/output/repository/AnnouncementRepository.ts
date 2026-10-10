import { CreateAnnouncementRequestDTO } from "@/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";

export interface AnnouncementRepository {
  /**
   * Creates a new announcement.
   *
   * @param contestId The ID of the contest to which the announcement belongs.
   * @param requestDTO The data for creating the announcement.
   * @returns The created announcement.
   */
  create(
    contestId: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO>;
}
