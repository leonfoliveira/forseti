import { randomUUID } from "crypto";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";

export function MockMemberPublicResponseDTO(
  partial: Partial<MemberPublicResponseDTO> = {},
): MemberPublicResponseDTO {
  return {
    id: randomUUID(),
    type: MemberType.CONTESTANT,
    name: "Test User",
    ...partial,
  };
}
