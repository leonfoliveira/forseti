import { MemberType } from "@/core/domain/enumerate/MemberType";

export type MemberResponseDTO = {
  id: number;
  type: MemberType;
  name: string;
  login: string;
};
