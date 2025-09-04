import { randomUUID } from "crypto";

import { AxiosResponse } from "axios";
import { mock } from "jest-mock-extended";

import { AxiosClient } from "@/adapter/axios/AxiosClient";
import { AxiosLeaderboardRepository } from "@/adapter/axios/AxiosLeaderboardRepository";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("AxiosLeaderboardRepository", () => {
  const axiosClient = mock<AxiosClient>();

  const sut = new AxiosLeaderboardRepository(axiosClient);

  const contestId = randomUUID();

  describe("findContestLeaderboard", () => {
    it("should find the contest leaderboard", async () => {
      const expectedResponse = MockLeaderboardResponseDTO();
      axiosClient.get.mockResolvedValueOnce({
        data: expectedResponse,
      } as AxiosResponse);

      const result = await sut.findContestLeaderboard(contestId);

      expect(axiosClient.get).toHaveBeenCalledWith(
        `/v1/contests/${contestId}/leaderboard`,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
