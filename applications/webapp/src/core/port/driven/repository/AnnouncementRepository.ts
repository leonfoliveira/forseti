import { CreateAnnouncementRequestDTO } from "@/core/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export interface AnnouncementRepository {
  /**
   * Create an announcement for a specific contest.
   *
   * @param contestId ID of the contest
   * @param requestDTO Announcement creation request data
   * @returns The created announcement
   */
  create(
    contestId: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO>;
}
