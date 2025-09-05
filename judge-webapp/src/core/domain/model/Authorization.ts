import { MemberType } from "@/core/domain/enumerate/MemberType";

export type Authorization = {
  member: {
    id: string;
    contestId: string;
    name: string;
    type: MemberType;
  };
  expiresAt: string;
};
