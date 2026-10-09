import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";

export type ExecutionResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  answer: SubmissionAnswer;
  totalTestCases: number;
  approvedTestCases: number;
  maxCpuTimeMs?: number;
  maxClockTimeMs?: number;
  maxPeakMemoryKb?: number;
  details?: AttachmentResponseDTO;
  version: number;
};
