import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { LeaderboardService } from "@/core/application/service/LeaderboardService";
import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("LeaderboardService", () => {
  const LeaderboardRepository = mock<LeaderboardRepository>();

  const sut = new LeaderboardService(LeaderboardRepository);

  const contestId = uuidv4();

  describe("build", () => {
    it("should call LeaderboardRepository.create with the correct parameters", async () => {
      const expectedResult = MockLeaderboardResponseDTO();
      LeaderboardRepository.build.mockResolvedValue(expectedResult);
      const result = await sut.build(contestId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("freeze", () => {
    it("should call LeaderboardRepository.freeze with the correct parameters", async () => {
      await sut.freeze(contestId);
      expect(LeaderboardRepository.freeze).toHaveBeenCalledWith(contestId);
    });
  });

  describe("unfreeze", () => {
    it("should call LeaderboardRepository.unfreeze with the correct parameters", async () => {
      await sut.unfreeze(contestId);
      expect(LeaderboardRepository.unfreeze).toHaveBeenCalledWith(contestId);
    });
  });
});
