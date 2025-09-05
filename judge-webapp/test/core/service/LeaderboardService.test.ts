import { randomUUID } from "crypto";

import { mock } from "jest-mock-extended";

import { LeaderboardRepository } from "@/core/repository/LeaderboardRepository";
import { LeaderboardService } from "@/core/service/LeaderboardService";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("LeaderboardService", () => {
  const LeaderboardRepository = mock<LeaderboardRepository>();

  const sut = new LeaderboardService(LeaderboardRepository);

  const contestId = randomUUID();

  describe("createAnnouncement", () => {
    it("should call LeaderboardRepository.create with the correct parameters", async () => {
      const expectedResult = MockLeaderboardResponseDTO();
      LeaderboardRepository.findContestLeaderboard.mockResolvedValue(
        expectedResult,
      );
      const result = await sut.findContestLeaderboard(contestId);
      expect(result).toEqual(expectedResult);
    });
  });
});
