import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { MemberResponseDTO } from "@/core/port/dto/response/member/MemberResponseDTO";
import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";

export type SubmissionResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  problem: ProblemResponseDTO;
  member: MemberResponseDTO;
  language: SubmissionLanguage;
  status: SubmissionStatus;
  answer?: SubmissionAnswer;
  version: number;
};
