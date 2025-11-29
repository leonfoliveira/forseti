import { v4 as uuidv4 } from "uuid";

import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionFullResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionFullResponseDTO";
import { MockAttachment } from "@/test/mock/model/MockAttachment";
import { MockMemberFullResponseDTO } from "@/test/mock/response/member/MockMemberFullResponseDTO";
import { MockProblemFullResponseDTO } from "@/test/mock/response/problem/MockProblemFullResponseDTO";

export function MockSubmissionFullResponseDTO(
  partial: Partial<SubmissionFullResponseDTO> = {},
): SubmissionFullResponseDTO {
  return {
    id: uuidv4(),
    problem: MockProblemFullResponseDTO(),
    member: MockMemberFullResponseDTO(),
    language: Language.CPP_17,
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.ACCEPTED,
    code: MockAttachment({
      filename: "solution.cpp",
      contentType: "text/plain",
    }),
    createdAt: "2025-01-01T10:00:00Z",
    ...partial,
  };
}
