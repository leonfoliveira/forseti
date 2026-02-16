import { v4 as uuidv4 } from "uuid";

import { ProblemFullResponseDTO } from "@/core/port/dto/response/problem/ProblemFullResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";

export function MockProblemFullResponseDTO(
  partial: Partial<ProblemFullResponseDTO> = {},
): ProblemFullResponseDTO {
  return {
    id: uuidv4(),
    letter: "A",
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
