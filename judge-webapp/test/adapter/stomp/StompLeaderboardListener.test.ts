import { randomUUID } from "crypto";

import { mock } from "jest-mock-extended";

import { StompLeaderboardListener } from "@/adapter/stomp/StompLeaderboardListener";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

describe("StompLeaderboardListener", () => {
  const sut = new StompLeaderboardListener();

  const contestId = randomUUID();

  describe("subscribeForLeaderboard", () => {
    it("should subscribe to the contest leaderboard", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboard(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard`,
        callback,
      );
    });
  });
});
