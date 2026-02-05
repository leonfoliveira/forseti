import { v4 as uuidv4 } from "uuid";

import { ProblemPublicResponseDTO } from "@/core/port/dto/response/problem/ProblemPublicResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";

export function MockProblemPublicResponseDTO(
  partial: Partial<ProblemPublicResponseDTO> = {},
): ProblemPublicResponseDTO {
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
    ...partial,
  };
}
