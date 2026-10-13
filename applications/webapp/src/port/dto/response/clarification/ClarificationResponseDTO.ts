import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

export type ClarificationResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  contest: ContestResponseDTO;
  problem?: ProblemResponseDTO;
  member: MemberResponseDTO;
  text: string;
  answer?: {
    member: MemberResponseDTO;
    text: string;
    createdAt: string;
  };
  isPublic: boolean;
  version: number;
};
