import { v4 as uuidv4 } from "uuid";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ExecutionResponseDTO } from "@/core/port/dto/response/execution/ExecutionResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";

export function MockExecutionResponseDTO(
  partial: Partial<ExecutionResponseDTO> = {},
): ExecutionResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    answer: SubmissionAnswer.ACCEPTED,
    totalTestCases: 10,
    lastTestCase: 10,
    input: MockAttachmentResponseDTO(),
    output: MockAttachmentResponseDTO(),
    version: 1,
    ...partial,
  };
}
