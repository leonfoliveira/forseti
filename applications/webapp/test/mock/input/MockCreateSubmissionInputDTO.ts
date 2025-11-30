import { v4 as uuidv4 } from "uuid";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { CreateSubmissionInputDTO } from "@/core/port/driving/usecase/submission/SubmissionWritter";

export function MockCreateSubmissionInputDTO(
  partial: Partial<CreateSubmissionInputDTO> = {},
): CreateSubmissionInputDTO {
  return {
    problemId: uuidv4(),
    language: SubmissionLanguage.CPP_17,
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
