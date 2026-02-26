import { v4 as uuidv4 } from "uuid";

import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

export function MockLeaderboardResponseDTO(
  partial: Partial<LeaderboardResponseDTO> = {},
): LeaderboardResponseDTO {
  return {
    contestId: uuidv4(),
    contestStartAt: "2025-01-01T10:00:00Z",
    isFrozen: false,
    issuedAt: "2025-01-01T15:00:00Z",
    rows: [
      {
        memberId: uuidv4(),
        memberName: "Test User",
        score: 100,
        penalty: 60,
        cells: [
          {
            problemId: uuidv4(),
            problemLetter: "A",
            problemColor: "#ffffff",
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
