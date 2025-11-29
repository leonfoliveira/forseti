import { CreateAnnouncementRequestDTO } from "@/core/port/driven/repository/dto/request/CreateAnnouncementRequestDTO";

export function MockCreateAnnouncementRequestDTO(
  partial: Partial<CreateAnnouncementRequestDTO> = {},
): CreateAnnouncementRequestDTO {
  return {
    text: "Test announcement text",
    ...partial,
  };
}
