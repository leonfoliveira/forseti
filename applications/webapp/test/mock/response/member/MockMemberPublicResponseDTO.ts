import { v4 as uuidv4 } from "uuid";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MemberPublicResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberPublicResponseDTO";

export function MockMemberPublicResponseDTO(
  partial: Partial<MemberPublicResponseDTO> = {},
): MemberPublicResponseDTO {
  return {
    id: uuidv4(),
    type: MemberType.CONTESTANT,
    name: "Test User",
    ...partial,
  };
}
