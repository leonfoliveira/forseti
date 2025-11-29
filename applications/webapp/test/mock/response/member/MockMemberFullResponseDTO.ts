import { v4 as uuidv4 } from "uuid";

import { MemberType } from "@/core/domain/enumerate/MemberType";
import { MemberFullResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberFullResponseDTO";

export function MockMemberFullResponseDTO(
  partial: Partial<MemberFullResponseDTO> = {},
): MemberFullResponseDTO {
  return {
    id: uuidv4(),
    type: MemberType.CONTESTANT,
    name: "Test User",
    login: "testuser",
    ...partial,
  };
}
