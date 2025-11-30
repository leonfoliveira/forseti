import { MemberPublicResponseDTO } from "@/core/port/dto/response/member/MemberPublicResponseDTO";

export type SessionResponseDTO = {
  id: string;
  member: MemberPublicResponseDTO;
  expiresAt: string;
};
