import { randomUUID } from "crypto";

import { Language } from "@/core/domain/enumerate/Language";
import { CreateSubmissionRequestDTO } from "@/core/repository/dto/request/CreateSubmissionRequestDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";

export function MockCreateSubmissionRequestDTO(
  partial: Partial<CreateSubmissionRequestDTO> = {},
): CreateSubmissionRequestDTO {
  return {
    problemId: randomUUID(),
    language: Language.CPP_17,
    code: MockAttachment({
      filename: "solution.cpp",
      contentType: "text/plain",
    }),
    ...partial,
  };
}
