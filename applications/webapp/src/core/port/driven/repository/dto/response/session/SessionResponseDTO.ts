import { MemberPublicResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberPublicResponseDTO";

export type SessionResponseDTO = {
  id: string;
  member: MemberPublicResponseDTO;
  expiresAt: string;
};
