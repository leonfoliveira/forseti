import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";

export type AnnouncementResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contest: ContestResponseDTO;
  member: MemberResponseDTO;
  text: string;
  version: number;
};
