import { MemberPublicResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberPublicResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/driven/repository/dto/response/problem/ProblemPublicResponseDTO";

export type ClarificationResponseDTO = {
  id: string;
  createdAt: string;
  member: MemberPublicResponseDTO;
  problem?: ProblemPublicResponseDTO;
  parentId?: string;
  text: string;
  children: ClarificationResponseDTO[];
};
