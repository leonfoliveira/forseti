import { randomUUID } from "crypto";

import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";

export function MockAnnouncementResponseDTO(
  partial: Partial<AnnouncementResponseDTO> = {},
): AnnouncementResponseDTO {
  return {
    id: randomUUID(),
    createdAt: "2025-01-01T10:00:00Z",
    member: MockMemberPublicResponseDTO(),
    text: "Test announcement text",
    ...partial,
  };
}
