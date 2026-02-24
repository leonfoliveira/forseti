import { v4 as uuidv4 } from "uuid";

import { SessionResponseDTO } from "@/core/port/dto/response/session/SessionResponseDTO";
import { MockMemberResponseDTO } from "@/test/mock/response/member/MockMemberResponseDTO";

export function MockSession(
  partial: Partial<SessionResponseDTO> = {},
): SessionResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    contestId: uuidv4(),
    member: MockMemberResponseDTO(),
    expiresAt: "2025-01-01T00:00:00Z",
    version: 1,
    ...partial,
  };
}
