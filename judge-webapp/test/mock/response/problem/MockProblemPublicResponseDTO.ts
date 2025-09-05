import { randomUUID } from "crypto";

import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockProblemPublicResponseDTO(
  partial: Partial<ProblemPublicResponseDTO> = {},
): ProblemPublicResponseDTO {
  return {
    id: randomUUID(),
    letter: "A",
    title: "Test Problem",
    description: MockAttachment({
      filename: "problem.pdf",
      contentType: "application/pdf",
    }),
    ...partial,
  };
}
