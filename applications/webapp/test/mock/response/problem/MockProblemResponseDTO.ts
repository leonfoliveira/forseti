import { v4 as uuidv4 } from "uuid";

import { ProblemResponseDTO } from "@/core/port/dto/response/problem/ProblemResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";

export function MockProblemResponseDTO(
  partial: Partial<ProblemResponseDTO> = {},
): ProblemResponseDTO {
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
    version: 1,
    ...partial,
  };
}
