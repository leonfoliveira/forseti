import { MemberType } from "@/domain/enumerate/MemberType";

export type MemberResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contestId?: string;
  type: MemberType;
  name: string;
  version: number;
};
