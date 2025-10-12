import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";

export type ClarificationResponseDTO = {
  id: string;
  createdAt: string;
  member: MemberPublicResponseDTO;
  problem?: ProblemPublicResponseDTO;
  parentId?: string;
  text: string;
  children: ClarificationResponseDTO[];
};
