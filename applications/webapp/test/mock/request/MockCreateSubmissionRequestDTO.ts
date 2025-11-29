import { v4 as uuidv4 } from "uuid";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { CreateSubmissionRequestDTO } from "@/core/port/dto/request/CreateSubmissionRequestDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";

export function MockCreateSubmissionRequestDTO(
  partial: Partial<CreateSubmissionRequestDTO> = {},
): CreateSubmissionRequestDTO {
  return {
    problemId: uuidv4(),
    language: SubmissionLanguage.CPP_17,
    code: MockAttachmentResponseDTO({
      filename: "solution.cpp",
      contentType: "text/plain",
    }),
    ...partial,
  };
}
