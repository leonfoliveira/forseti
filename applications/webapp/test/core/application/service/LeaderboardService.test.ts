import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { LeaderboardService } from "@/core/application/service/LeaderboardService";
import { LeaderboardRepository } from "@/core/port/driven/repository/LeaderboardRepository";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/contest/MockContestWithMembersAndProblemsDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("LeaderboardService", () => {
  const leaderboardRepository = mock<LeaderboardRepository>();

  const sut = new LeaderboardService(leaderboardRepository);

  const contestId = uuidv4();

  describe("get", () => {
    it("should call LeaderboardRepository.get with the correct parameters", async () => {
      const leaderboardResponse = MockLeaderboardResponseDTO();
      leaderboardRepository.get.mockResolvedValue(leaderboardResponse);

      const result = await sut.get(contestId);

      expect(result).toEqual(leaderboardResponse);
      expect(leaderboardRepository.get).toHaveBeenCalledWith(contestId);
    });
  });

  describe("freeze", () => {
    it("should call LeaderboardRepository.freeze with the correct parameters", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      leaderboardRepository.freeze.mockResolvedValue(contest);

      const result = await sut.freeze(contestId);

      expect(result).toEqual(contest);
      expect(leaderboardRepository.freeze).toHaveBeenCalledWith(contestId);
    });
  });

  describe("unfreeze", () => {
    it("should call LeaderboardRepository.unfreeze with the correct parameters", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      leaderboardRepository.unfreeze.mockResolvedValue(contest);

      const result = await sut.unfreeze(contestId);

      expect(result).toEqual(contest);
      expect(leaderboardRepository.unfreeze).toHaveBeenCalledWith(contestId);
    });
  });
});
