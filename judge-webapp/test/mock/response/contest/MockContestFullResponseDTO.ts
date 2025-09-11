import { v4 as uuidv4 } from "uuid";

import { Language } from "@/core/domain/enumerate/Language";
import { ContestFullResponseDTO } from "@/core/repository/dto/response/contest/ContestFullResponseDTO";
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
    languages: [Language.CPP_17, Language.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    announcements: [MockAnnouncementResponseDTO()],
    clarifications: [MockClarificationResponseDTO()],
    members: [MockMemberFullResponseDTO()],
    problems: [MockProblemFullResponseDTO()],
    ...partial,
  };
}
