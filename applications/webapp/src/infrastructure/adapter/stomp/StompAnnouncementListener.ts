import { AnnouncementListener } from "@/core/port/driven/listener/AnnouncementListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export class StompAnnouncementListener implements AnnouncementListener {
  /**
   * Subscribe to announcements updates for a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param cb Callback function to handle received announcements.
   */
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (announcement: AnnouncementResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/announcements`, cb);
  }
}
