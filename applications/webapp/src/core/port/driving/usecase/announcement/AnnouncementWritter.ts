import { CreateAnnouncementRequestDTO } from "@/core/port/dto/request/CreateAnnouncementRequestDTO";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export interface AnnouncementWritter {
  /**
   * Create an announcement for a contest.
   *
   * @param contestId ID of the contest
   * @param inputDTO Data for creating the announcement
   * @return The created announcement
   */
  create(
    contestId: string,
    inputDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO>;
}
