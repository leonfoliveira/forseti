import { v4 as uuidv4 } from "uuid";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestFullResponseDTO } from "@/core/port/dto/response/contest/ContestFullResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockMemberFullResponseDTO } from "@/test/mock/response/member/MockMemberFullResponseDTO";
import { MockProblemFullResponseDTO } from "@/test/mock/response/problem/MockProblemFullResponseDTO";

export function MockContestFullResponseDTO(
  partial: Partial<ContestFullResponseDTO> = {},
): ContestFullResponseDTO {
  return {
    id: uuidv4(),
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    settings: {
      isAutoJudgeEnabled: false,
    },
    announcements: [MockAnnouncementResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    members: [MockMemberFullResponseDTO()],
    problems: [MockProblemFullResponseDTO()],
    version: 1,
    ...partial,
  };
}
