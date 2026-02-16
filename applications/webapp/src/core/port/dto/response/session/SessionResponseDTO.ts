import { ContestMetadataResponseDTO } from "@/core/port/dto/response/contest/ContestMetadataResponseDTO";
import { MemberPublicResponseDTO } from "@/core/port/dto/response/member/MemberPublicResponseDTO";

export type SessionResponseDTO = {
  id: string;
  contest?: ContestMetadataResponseDTO;
  member: MemberPublicResponseDTO;
  expiresAt: string;
  version: number;
};
