import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { MemberPublicResponseDTO } from "@/core/port/dto/response/member/MemberPublicResponseDTO";
import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";

export type SubmissionPublicResponseDTO = {
  id: string;
  problem: ProblemPublicResponseDTO;
  member: MemberPublicResponseDTO;
  language: Language;
  status: SubmissionStatus;
  answer: SubmissionAnswer;
  createdAt: string;
};
