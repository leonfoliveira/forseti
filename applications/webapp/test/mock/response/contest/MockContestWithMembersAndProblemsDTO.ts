import { v4 as uuidv4 } from "uuid";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestWithMembersAndProblemsDTO } from "@/core/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { MockMemberWithLoginResponseDTO } from "@/test/mock/response/member/MockMemberWithLoginResponseDTO";
import { MockProblemWithTestCasesResponseDTO } from "@/test/mock/response/problem/MockProblemWithTestCasesResponseDTO";

export function MockContestWithMembersAndProblemsDTO(
  partial: Partial<ContestWithMembersAndProblemsDTO> = {},
): ContestWithMembersAndProblemsDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    settings: {
      isAutoJudgeEnabled: false,
    },
    members: [MockMemberWithLoginResponseDTO()],
    problems: [MockProblemWithTestCasesResponseDTO()],
    version: 1,
    ...partial,
  };
}
