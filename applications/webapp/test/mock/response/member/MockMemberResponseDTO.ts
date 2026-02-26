import { v4 as uuidv4 } from "uuid";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";

export function MockMemberResponseDTO(
  partial: Partial<MemberResponseDTO> = {},
): MemberResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    type: MemberType.CONTESTANT,
    name: "Test User",
    version: 1,
    ...partial,
  };
}
