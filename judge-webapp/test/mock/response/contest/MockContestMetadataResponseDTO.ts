import { randomUUID } from "crypto";

import { Language } from "@/core/domain/enumerate/Language";
import { ContestMetadataResponseDTO } from "@/core/repository/dto/response/contest/ContestMetadataResponseDTO";

export function MockContestMetadataResponseDTO(
  partial: Partial<ContestMetadataResponseDTO> = {},
): ContestMetadataResponseDTO {
  return {
    id: randomUUID(),
    slug: "test-contest",
    title: "Test Contest",
    languages: [Language.CPP_17, Language.JAVA_21],
    startAt: "2025-01-01T10:00:00Z",
    endAt: "2025-01-01T15:00:00Z",
    ...partial,
  };
}
