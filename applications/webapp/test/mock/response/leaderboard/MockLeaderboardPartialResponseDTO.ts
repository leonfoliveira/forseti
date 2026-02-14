import { v4 as uuidv4 } from "uuid";

import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";

export function MockLeaderboardPartialResponseDTO(
  partial: Partial<LeaderboardPartialResponseDTO> = {},
): LeaderboardPartialResponseDTO {
  return {
    memberId: uuidv4(),
    problemId: uuidv4(),
    letter: "A",
    isAccepted: true,
    acceptedAt: "2025-01-01T11:00:00Z",
    wrongSubmissions: 1,
    penalty: 60,
    ...partial,
  };
}
