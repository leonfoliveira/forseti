import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { Attachment } from "@/core/domain/model/Attachment";
import { ProblemFullResponseDTO } from "@/core/repository/dto/response/ProblemFullResponseDTO";
import { MemberFullResponseDTO } from "@/core/repository/dto/response/MemberFullResponseDTO";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

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
