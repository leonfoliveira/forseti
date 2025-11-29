import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { StompLeaderboardListener } from "@/infrastructure/adapter/stomp/StompLeaderboardListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";

describe("StompLeaderboardListener", () => {
  const sut = new StompLeaderboardListener();

  const contestId = uuidv4();

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
