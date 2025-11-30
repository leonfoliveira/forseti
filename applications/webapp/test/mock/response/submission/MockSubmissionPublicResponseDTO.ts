import { v4 as uuidv4 } from "uuid";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";

export function MockSubmissionPublicResponseDTO(
  partial: Partial<SubmissionPublicResponseDTO> = {},
): SubmissionPublicResponseDTO {
  return {
    id: uuidv4(),
    problem: MockProblemPublicResponseDTO(),
    member: MockMemberPublicResponseDTO(),
    language: SubmissionLanguage.CPP_17,
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.ACCEPTED,
    createdAt: "2025-01-01T10:00:00Z",
    ...partial,
  };
}
