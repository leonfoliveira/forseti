import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { AnnouncementListener } from "@/core/listener/AnnouncementListener";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export class StompAnnouncementListener implements AnnouncementListener {
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (announcement: AnnouncementResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/announcements`, cb);
  }
}
