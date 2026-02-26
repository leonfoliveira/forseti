import { v4 as uuidv4 } from "uuid";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { MockAttachmentResponseDTO } from "@/test/mock/response/attachment/MockAttachmentResponseDTO";
import { MockMemberWithLoginResponseDTO } from "@/test/mock/response/member/MockMemberWithLoginResponseDTO";
import { MockProblemWithTestCasesResponseDTO } from "@/test/mock/response/problem/MockProblemWithTestCasesResponseDTO";

export function MockSubmissionWithCodeResponseDTO(
  partial: Partial<SubmissionWithCodeResponseDTO> = {},
): SubmissionWithCodeResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    problem: MockProblemWithTestCasesResponseDTO(),
    member: MockMemberWithLoginResponseDTO(),
    language: SubmissionLanguage.CPP_17,
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.ACCEPTED,
    code: MockAttachmentResponseDTO({
      filename: "solution.cpp",
      contentType: "text/plain",
    }),
    version: 1,
    ...partial,
  };
}
