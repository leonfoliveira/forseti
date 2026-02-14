import { Member } from "@/test/entity/member";
import { Problem } from "@/test/entity/problem";

export type Clarification = {
  member: Member;
  problem?: Problem;
  text: string;
  answer?: Clarification;
};
