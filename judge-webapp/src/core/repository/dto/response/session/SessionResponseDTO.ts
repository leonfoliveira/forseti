import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";

export type SessionResponseDTO = {
  id: string;
  member: MemberPublicResponseDTO;
  expiresAt: string;
};
