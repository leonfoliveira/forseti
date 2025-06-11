import { Language } from "@/core/domain/enumerate/Language";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { MemberPublicResponseDTO } from "@/core/repository/dto/response/member/MemberPublicResponseDTO";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

export type SubmissionPublicResponseDTO = {
  id: string;
  problem: ProblemPublicResponseDTO;
  member: MemberPublicResponseDTO;
  language: Language;
  answer: SubmissionAnswer;
  createdAt: string;
};
