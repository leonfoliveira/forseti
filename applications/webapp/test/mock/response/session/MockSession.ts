import { v4 as uuidv4 } from "uuid";

import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";

export function MockSession(
  partial: Partial<SessionResponseDTO> = {},
): SessionResponseDTO {
  return {
    id: uuidv4(),
    member: MockMemberPublicResponseDTO(),
    expiresAt: "2025-01-01T00:00:00Z",
    ...partial,
  };
}
