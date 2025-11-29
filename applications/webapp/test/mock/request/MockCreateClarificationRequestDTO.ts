import { v4 as uuidv4 } from "uuid";

import { CreateClarificationRequestDTO } from "@/core/port/driven/repository/dto/request/CreateClarificationRequestDTO";

export function MockCreateClarificationRequestDTO(
  partial: Partial<CreateClarificationRequestDTO> = {},
): CreateClarificationRequestDTO {
  return {
    problemId: uuidv4(),
    parentId: uuidv4(),
    text: "Test clarification text",
    ...partial,
  };
}
