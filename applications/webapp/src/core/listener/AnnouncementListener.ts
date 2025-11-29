import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";

export interface AnnouncementListener {
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (announcement: AnnouncementResponseDTO) => void,
  ) => Promise<void>;
}
