import { v4 as uuidv4 } from "uuid";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachment";
import { MockMemberFullResponseDTO } from "@/test/mock/response/member/MockMemberFullResponseDTO";
import { MockProblemFullResponseDTO } from "@/test/mock/response/problem/MockProblemFullResponseDTO";

export function MockSubmissionFullResponseDTO(
  partial: Partial<SubmissionFullResponseDTO> = {},
): SubmissionFullResponseDTO {
  return {
    id: uuidv4(),
    problem: MockProblemFullResponseDTO(),
    member: MockMemberFullResponseDTO(),
    language: SubmissionLanguage.CPP_17,
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.ACCEPTED,
    code: MockAttachmentResponseDTO({
      filename: "solution.cpp",
      contentType: "text/plain",
    }),
    createdAt: "2025-01-01T10:00:00Z",
    version: 1,
    ...partial,
  };
}
