import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";

export type ExecutionResponseDTO = {
  id: string;
  answer: SubmissionAnswer;
  totalTestCases: number;
  lastTestCase?: number;
  input: AttachmentResponseDTO;
  output: AttachmentResponseDTO;
  createdAt: string;
  version: number;
};
