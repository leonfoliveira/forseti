import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import type { CreateAnnouncementRequestDTO } from "@/port/dto/request/CreateAnnouncementRequestDTO";

export interface AnnouncementWritter {
  /**
   * Creates a new announcement for a specific contest.
   *
   * @param contestId The ID of the contest for which the announcement is being created.
   * @param requestDTO The data transfer object containing the details of the announcement to be created.
   */
  create(
    contestId: string,
    requestDTO: CreateAnnouncementRequestDTO,
  ): Promise<AnnouncementResponseDTO>;
}
