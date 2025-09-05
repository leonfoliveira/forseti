import { randomUUID } from "crypto";

import { CreateClarificationRequestDTO } from "@/core/repository/dto/request/CreateClarificationRequestDTO";

export function MockCreateClarificationRequestDTO(
  partial: Partial<CreateClarificationRequestDTO> = {},
): CreateClarificationRequestDTO {
  return {
    problemId: randomUUID(),
    parentId: randomUUID(),
    text: "Test clarification text",
    ...partial,
  };
}
