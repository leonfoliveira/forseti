import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";

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
