import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { AxiosClient } from "@/infrastructure/adapter/axios/AxiosClient";
import { AxiosLeaderboardRepository } from "@/infrastructure/adapter/axios/repository/AxiosLeaderboardRepository";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("AxiosLeaderboardRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosLeaderboardRepository(axiosClient);

  const contestId = uuidv4();

  describe("findContestLeaderboard", () => {
    it("should find the contest leaderboard", async () => {
      const expectedResponse = MockLeaderboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.build(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("freeze", () => {
    it("should freeze the contest leaderboard", async () => {
      await sut.freeze(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard:freeze`,
      );
    });
  });

  describe("unfreeze", () => {
    it("should unfreeze the contest leaderboard", async () => {
      await sut.unfreeze(contestId);

      expect(axiosClient.put).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard:unfreeze`,
      );
    });
  });
});
