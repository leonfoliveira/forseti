import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Attachment } from "@/core/domain/model/Attachment";
import { MemberFullResponseDTO } from "@/core/port/driven/repository/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/port/driven/repository/dto/response/problem/ProblemFullResponseDTO";

export type SubmissionFullResponseDTO = {
  id: string;
  problem: ProblemFullResponseDTO;
  member: MemberFullResponseDTO;
  language: Language;
  status: SubmissionStatus;
  answer: SubmissionAnswer;
  code: Attachment;
  createdAt: string;
};
