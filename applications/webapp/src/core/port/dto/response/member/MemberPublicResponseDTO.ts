import { MemberType } from "@/core/domain/enumerate/MemberType";

export type MemberPublicResponseDTO = {
  id: string;
  type: MemberType;
  name: string;
  version: number;
};
