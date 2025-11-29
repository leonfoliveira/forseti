import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { LeaderboardService } from "@/core/service/LeaderboardService";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("LeaderboardService", () => {
  const LeaderboardRepository = mock<LeaderboardRepository>();

  const sut = new LeaderboardService(LeaderboardRepository);

  const contestId = uuidv4();

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
