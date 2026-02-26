import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";

export type AnnouncementResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  member: MemberResponseDTO;
  text: string;
  version: number;
};
