import { v4 as uuidv4 } from "uuid";

import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";

export function MockLeaderboardCellResponseDTO(
  partial: Partial<LeaderboardCellResponseDTO> = {},
): LeaderboardCellResponseDTO {
  return {
    memberId: uuidv4(),
    problemId: uuidv4(),
    problemLetter: "A",
    problemColor: "#ffffff",
    letter: "A",
    isAccepted: true,
    acceptedAt: "2025-01-01T11:00:00Z",
    wrongSubmissions: 1,
    penalty: 60,
    ...partial,
  };
}
