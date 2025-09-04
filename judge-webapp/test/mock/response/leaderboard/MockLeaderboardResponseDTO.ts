import { randomUUID } from "crypto";

import { LeaderboardResponseDTO } from "@/core/repository/dto/response/leaderboard/LeaderboardResponseDTO";

export function MockLeaderboardResponseDTO(
  partial: Partial<LeaderboardResponseDTO> = {},
): LeaderboardResponseDTO {
  return {
    contestId: randomUUID(),
    slug: "test-contest",
    startAt: "2025-01-01T10:00:00Z",
    issuedAt: "2025-01-01T15:00:00Z",
    members: [
      {
        id: randomUUID(),
        name: "Test User",
        score: 100,
        penalty: 60,
        problems: [
          {
            id: randomUUID(),
            letter: "A",
            isAccepted: true,
            acceptedAt: "2025-01-01T11:00:00Z",
            wrongSubmissions: 1,
            penalty: 60,
          },
        ],
      },
    ],
    ...partial,
  };
}
