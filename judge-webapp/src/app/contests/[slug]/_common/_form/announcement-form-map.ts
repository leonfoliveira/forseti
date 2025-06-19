import { AnnouncementFormType } from "@/app/contests/[slug]/_common/_form/announcement-form-type";
import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";

export function toInputDTO(
  data: AnnouncementFormType,
): CreateAnnouncementRequestDTO {
  return {
    text: data.text as string,
  };
}
