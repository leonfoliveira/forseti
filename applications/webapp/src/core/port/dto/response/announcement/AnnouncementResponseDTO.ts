import { MemberPublicResponseDTO } from "@/core/port/dto/response/member/MemberPublicResponseDTO";

export type AnnouncementResponseDTO = {
  id: string;
  createdAt: string;
  member: MemberPublicResponseDTO;
  text: string;
  version: number;
};
