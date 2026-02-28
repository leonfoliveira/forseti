import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosLeaderboardRepository } from "@/infrastructure/adapter/axios/repository/AxiosLeaderboardRepository";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/contest/MockContestWithMembersAndProblemsDTO";

describe("AxiosLeaderboardRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosLeaderboardRepository(axiosClient);

  const contestId = uuidv4();

  describe("get", () => {
    it("should retrieve the contest leaderboard", async () => {
      const leaderboard = MockContestWithMembersAndProblemsDTO();
      (axiosClient.get as jest.Mock).mockResolvedValueOnce({
        data: leaderboard,
      });

      const result = await sut.get(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard`,
      );
      expect(result).toEqual(leaderboard);
    });
  });

  describe("freeze", () => {
    it("should freeze the contest leaderboard", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      (axiosClient.put as jest.Mock).mockResolvedValueOnce({
        data: contest,
      });

      const result = await sut.freeze(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard:freeze`,
      );
      expect(result).toEqual(contest);
    });
  });

  describe("unfreeze", () => {
    it("should unfreeze the contest leaderboard", async () => {
      const contest = MockContestWithMembersAndProblemsDTO();
      (axiosClient.put as jest.Mock).mockResolvedValueOnce({
        data: contest,
      });

      const result = await sut.unfreeze(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard:unfreeze`,
      );
      expect(result).toEqual(contest);
    });
  });
});
