import { v4 as uuidv4 } from "uuid";

import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";

export function MockTicketResponseDTO(
  partial: Partial<TicketResponseDTO> = {},
): TicketResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    version: 1,
    member: MockMemberResponseDTO(),
    staff: MockMemberResponseDTO(),
    status: TicketStatus.IN_PROGRESS,
    type: TicketType.TECHNICAL_SUPPORT,
    properties: {
      description: "My submission is not being judged",
    },
    ...partial,
  } as TicketResponseDTO;
}
