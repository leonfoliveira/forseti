import { v4 as uuidv4 } from "uuid";

import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";

export function MockAnnouncementResponseDTO(
  partial: Partial<AnnouncementResponseDTO> = {},
): AnnouncementResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    member: MockMemberResponseDTO(),
    text: "Test announcement text",
    version: 1,
    ...partial,
  };
}
