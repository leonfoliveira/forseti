import { MemberPublicResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberPublicResponseDTO";

export type AnnouncementResponseDTO = {
  id: string;
  createdAt: string;
  member: MemberPublicResponseDTO;
  text: string;
};
