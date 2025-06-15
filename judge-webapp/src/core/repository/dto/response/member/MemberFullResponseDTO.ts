import { MemberType } from "@/core/domain/enumerate/MemberType";

export type MemberFullResponseDTO = {
  id: string;
  type: MemberType;
  name: string;
  login: string;
};
