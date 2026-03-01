import { v4 as uuidv4 } from "uuid";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MemberWithLoginResponseDTO } from "@/core/port/dto/response/member/MemberWithLoginResponseDTO";

export function MockMemberWithLoginResponseDTO(
  partial: Partial<MemberWithLoginResponseDTO> = {},
): MemberWithLoginResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    contestId: uuidv4(),
    type: MemberType.CONTESTANT,
    name: "Test User",
    login: "testuser",
    version: 1,
    ...partial,
  };
}
