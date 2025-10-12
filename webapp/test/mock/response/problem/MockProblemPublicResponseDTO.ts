import { v4 as uuidv4 } from "uuid";

import { ProblemPublicResponseDTO } from "@/core/repository/dto/response/problem/ProblemPublicResponseDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockProblemPublicResponseDTO(
  partial: Partial<ProblemPublicResponseDTO> = {},
): ProblemPublicResponseDTO {
  return {
    id: uuidv4(),
    letter: "A",
    title: "Test Problem",
    description: MockAttachment({
      filename: "problem.pdf",
      contentType: "application/pdf",
    }),
    ...partial,
  };
}
