import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";

export type SessionResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contestId: string;
  member: MemberResponseDTO;
  expiresAt: string;
  version: number;
};
