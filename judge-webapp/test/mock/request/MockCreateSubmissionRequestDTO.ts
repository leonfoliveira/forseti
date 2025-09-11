import { v4 as uuidv4 } from "uuid";

import { Language } from "@/core/domain/enumerate/Language";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockCreateSubmissionRequestDTO(
  partial: Partial<CreateSubmissionRequestDTO> = {},
): CreateSubmissionRequestDTO {
  return {
    problemId: uuidv4(),
    language: Language.CPP_17,
    code: MockAttachment({
      filename: "solution.cpp",
      contentType: "text/plain",
    }),
    ...partial,
  };
}
