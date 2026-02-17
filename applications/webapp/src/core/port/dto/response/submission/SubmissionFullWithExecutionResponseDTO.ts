import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { ExecutionResponseDTO } from "@/core/port/dto/response/execution/ExecutionResponseDTO";
import { MemberFullResponseDTO } from "@/core/port/dto/response/member/MemberFullResponseDTO";
import { ProblemFullResponseDTO } from "@/core/port/dto/response/problem/ProblemFullResponseDTO";

export type SubmissionFullWithExecutionResponseDTO = {
  id: string;
  problem: ProblemFullResponseDTO;
  member: MemberFullResponseDTO;
  language: SubmissionLanguage;
  status: SubmissionStatus;
  answer: SubmissionAnswer;
  code: AttachmentResponseDTO;
  createdAt: string;
  executions: ExecutionResponseDTO[];
  version: number;
};
