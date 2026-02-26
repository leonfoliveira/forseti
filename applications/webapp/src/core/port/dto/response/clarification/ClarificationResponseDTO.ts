import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";

export type ClarificationResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  member: MemberResponseDTO;
  problem?: ProblemResponseDTO;
  parentId?: string;
  text: string;
  children: ClarificationResponseDTO[];
  version: number;
};
