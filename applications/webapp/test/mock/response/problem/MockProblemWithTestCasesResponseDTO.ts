import { v4 as uuidv4 } from "uuid";

import { ProblemWithTestCasesResponseDTO } from "@/core/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";

export function MockProblemWithTestCasesResponseDTO(
  partial: Partial<ProblemWithTestCasesResponseDTO> = {},
): ProblemWithTestCasesResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    letter: "A",
    color: "#ffffff",
    title: "Test Problem",
    description: MockAttachmentResponseDTO({
      filename: "problem.pdf",
      contentType: "application/pdf",
    }),
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: MockAttachmentResponseDTO({
      filename: "testcases.csv",
      contentType: "text/csv",
    }),
    version: 1,
    ...partial,
  };
}
