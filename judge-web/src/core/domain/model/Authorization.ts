import {MemberType} from "@/core/domain/enumerate/MemberType";

export type Authorization = {
  id: number;
  name: string;
  login: string;
  type: MemberType;
}
