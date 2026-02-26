import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type ExecutionResponseDTO = {
  id: string;
  createdAt: string;
  updatedAt: string;
  answer: SubmissionAnswer;
  totalTestCases: number;
  lastTestCase?: number;
  input: AttachmentResponseDTO;
  output: AttachmentResponseDTO;
  version: number;
};
