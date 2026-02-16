import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { MemberFullResponseDTO } from "@/core/port/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/port/dto/response/problem/ProblemFullResponseDTO";

export type SubmissionFullResponseDTO = {
  id: string;
  problem: ProblemFullResponseDTO;
  member: MemberFullResponseDTO;
  language: SubmissionLanguage;
  status: SubmissionStatus;
  answer: SubmissionAnswer;
  code: AttachmentResponseDTO;
  createdAt: string;
  version: number;
};
