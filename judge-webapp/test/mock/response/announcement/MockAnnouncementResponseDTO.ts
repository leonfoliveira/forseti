import { v4 as uuidv4 } from "uuid";

import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";

export function MockAnnouncementResponseDTO(
  partial: Partial<AnnouncementResponseDTO> = {},
): AnnouncementResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    member: MockMemberPublicResponseDTO(),
    text: "Test announcement text",
    ...partial,
  };
}
