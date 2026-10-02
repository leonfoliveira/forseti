import { MemberType } from "@/domain/enumerate/MemberType";

export type SessionResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contestId: string;
  member: {
    id: string;
    name: string;
    type: MemberType;
  };
  expiresAt: string;
  version: number;
};
