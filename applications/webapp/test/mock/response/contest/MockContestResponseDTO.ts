import { v4 as uuidv4 } from "uuid";

import { SubmissionLanguage } from "@/core/domain/enumerate/SubmissionLanguage";
import { ContestResponseDTO } from "@/core/port/dto/response/contest/ContestResponseDTO";

export function MockContestResponseDTO(
  partial: Partial<ContestResponseDTO> = {},
): ContestResponseDTO {
  return {
    id: uuidv4(),
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
    slug: "test-contest",
    title: "Test Contest",
    languages: [SubmissionLanguage.CPP_17, SubmissionLanguage.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    autoFreezeAt: "2025-01-01T14:00:00Z",
    settings: {
      isAutoJudgeEnabled: true,
    },
    version: 1,
    ...partial,
  };
}
