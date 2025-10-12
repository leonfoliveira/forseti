import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";

export type AnnouncementResponseDTO = {
  id: string;
  createdAt: string;
  member: MemberPublicResponseDTO;
  text: string;
};
