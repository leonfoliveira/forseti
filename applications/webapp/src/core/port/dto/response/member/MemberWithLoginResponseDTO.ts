import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";

export type MemberWithLoginResponseDTO = MemberResponseDTO & {
  login: string;
};
