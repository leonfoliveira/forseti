import { randomUUID } from "crypto";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MemberFullResponseDTO } from "@/core/repository/dto/response/member/MemberFullResponseDTO";

export function MockMemberFullResponseDTO(
  partial: Partial<MemberFullResponseDTO> = {},
): MemberFullResponseDTO {
  return {
    id: randomUUID(),
    type: MemberType.CONTESTANT,
    name: "Test User",
    login: "testuser",
    ...partial,
  };
}
