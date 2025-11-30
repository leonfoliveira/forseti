import { v4 as uuidv4 } from "uuid";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestPublicResponseDTO } from "@/core/port/dto/response/contest/ContestPublicResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockMemberPublicResponseDTO } from "@/test/mock/response/member/MockMemberPublicResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";

export function MockContestPublicResponseDTO(
  partial: Partial<ContestPublicResponseDTO> = {},
): ContestPublicResponseDTO {
  return {
    id: uuidv4(),
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    announcements: [MockAnnouncementResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    problems: [MockProblemPublicResponseDTO()],
    members: [MockMemberPublicResponseDTO()],
    ...partial,
  };
}
