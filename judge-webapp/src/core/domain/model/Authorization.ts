import { MemberType } from "@/core/domain/enumerate/MemberType";

export type Authorization = {
  member: AuthorizationMember;
  expiresAt: string;
};

export type AuthorizationMember = {
  id: string;
  contestId: string;
  name: string;
  type: MemberType;
};
