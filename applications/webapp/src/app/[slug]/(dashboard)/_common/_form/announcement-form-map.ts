import { AnnouncementFormType } from "@/app/[slug]/(dashboard)/_common/_form/announcement-form";
import { CreateAnnouncementRequestDTO } from "@/core/port/driven/repository/dto/request/CreateAnnouncementRequestDTO";

export class AnnouncementFormMap {
  static toInputDTO(data: AnnouncementFormType): CreateAnnouncementRequestDTO {
    return {
      text: data.text,
    };
  }

  static getDefault(): AnnouncementFormType {
    return {
      text: "",
    };
  }
}
