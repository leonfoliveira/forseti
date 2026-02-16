import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { StompLeaderboardListener } from "@/infrastructure/adapter/stomp/StompLeaderboardListener";

describe("StompLeaderboardListener", () => {
  const sut = new StompLeaderboardListener();

  const contestId = uuidv4();

  describe("subscribeForLeaderboardPartial", () => {
    it("should subscribe to the contest partial leaderboard", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboardPartial(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard/partial`,
        callback,
      );
    });
  });

  describe("subscribeForLeaderboardFreeze", () => {
    it("should subscribe to the contest leaderboard freeze", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboardFreeze(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard/freeze`,
        callback,
      );
    });
  });

  describe("subscribeForLeaderboardUnfreeze", () => {
    it("should subscribe to the contest leaderboard unfreeze", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboardUnfreeze(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard/unfreeze`,
        callback,
      );
    });
  });
});
