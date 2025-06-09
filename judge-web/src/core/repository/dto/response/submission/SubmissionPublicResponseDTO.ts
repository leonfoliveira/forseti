import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/ProblemPublicResponseDTO";
import { MemberPublicResponseDTO } from "@/core/repository/dto/response/MemberPublicResponseDTO";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

export type SubmissionPublicResponseDTO = {
  id: string;
  problem: ProblemPublicResponseDTO;
  member: MemberPublicResponseDTO;
  language: Language;
  status: SubmissionStatus;
  answer: SubmissionAnswer;
  createdAt: string;
};
