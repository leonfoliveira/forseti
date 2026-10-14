import { Member } from "@/test/entity/Member";
import { Problem } from "@/test/entity/Problem";

export type Clarification = {
  member: Member;
  problem?: Problem;
  text: string;
  answer?: {
    member: Member;
    text: string;
  };
};
