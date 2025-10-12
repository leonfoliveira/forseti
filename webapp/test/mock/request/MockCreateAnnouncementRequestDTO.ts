import { CreateAnnouncementRequestDTO } from "@/core/repository/dto/request/CreateAnnouncementRequestDTO";

export function MockCreateAnnouncementRequestDTO(
  partial: Partial<CreateAnnouncementRequestDTO> = {},
): CreateAnnouncementRequestDTO {
  return {
    text: "Test announcement text",
    ...partial,
  };
}
