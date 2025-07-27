import { AnnouncementForm } from "@/app/contests/[slug]/_common/_form/announcement-form";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";

export class AnnouncementFormMap {
  static toInputDTO(data: AnnouncementForm): CreateAnnouncementRequestDTO {
    return {
      text: data.text as string,
    };
  }
}
