import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export interface AnnouncementListener {
  /**
   * Subscribe to announcements updates for a contest.
   *
   * @param client The listener client used to subscribe to the announcements.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming announcements.
   */
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (announcement: AnnouncementResponseDTO) => void,
  ) => Promise<void>;
}
