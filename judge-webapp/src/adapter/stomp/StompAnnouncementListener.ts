import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { AnnouncementListener } from "@/core/listener/AnnouncementListener";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";

export class StompAnnouncementListener implements AnnouncementListener {
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (announcement: AnnouncementResponseDTO) => void,
  ): Promise<ListenerClient> {
    await client.subscribe(`/topic/contests/${contestId}/announcements`, cb);
    return client;
  }
}
