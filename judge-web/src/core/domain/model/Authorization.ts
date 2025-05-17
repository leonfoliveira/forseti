import { MemberType } from "@/core/domain/enumerate/MemberType";

export type Authorization = {
  member: AuthorizationMember;
  accessToken: string;
};

export type AuthorizationMember = {
  id: number;
  name: string;
  login: string;
  type: MemberType;
};
