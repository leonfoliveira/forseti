import { v4 as uuidv4 } from "uuid";

import { ProblemFullResponseDTO } from "@/core/repository/dto/response/problem/ProblemFullResponseDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockProblemFullResponseDTO(
  partial: Partial<ProblemFullResponseDTO> = {},
): ProblemFullResponseDTO {
  return {
    id: uuidv4(),
    letter: "A",
    title: "Test Problem",
    description: MockAttachment({
      filename: "problem.pdf",
      contentType: "application/pdf",
    }),
    timeLimit: 1000,
    memoryLimit: 256,
    testCases: MockAttachment({
      filename: "testcases.csv",
      contentType: "text/csv",
    }),
    ...partial,
  };
}
