import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";

export type AnnouncementResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contest: ContestResponseDTO;
  member: MemberResponseDTO;
  text: string;
  version: number;
};
