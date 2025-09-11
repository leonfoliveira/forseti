import { v4 as uuidv4 } from "uuid";

import { Language } from "@/core/domain/enumerate/Language";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";

export function MockCreateSubmissionInputDTO(
  partial: Partial<CreateSubmissionInputDTO> = {},
): CreateSubmissionInputDTO {
  return {
    problemId: uuidv4(),
    language: Language.CPP_17,
    code: new File(
      ["#include <iostream>\nint main() { return 0; }"],
      "solution.cpp",
      {
        type: "text/plain",
      },
    ),
    ...partial,
  };
}
