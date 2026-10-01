import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";

export type MemberWithLoginResponseDTO = MemberResponseDTO & {
  login: string;
};
