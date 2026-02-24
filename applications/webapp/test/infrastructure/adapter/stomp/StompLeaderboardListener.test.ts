import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { StompLeaderboardListener } from "@/infrastructure/adapter/stomp/StompLeaderboardListener";

describe("StompLeaderboardListener", () => {
  const sut = new StompLeaderboardListener();

  const contestId = uuidv4();

  describe("subscribeForLeaderboardCell", () => {
    it("should subscribe to the contest leaderboard cell", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboardCell(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard:cell`,
        callback,
      );
    });
  });

  describe("subscribeForLeaderboardFrozen", () => {
    it("should subscribe to the contest leaderboard frozen", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboardFrozen(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard:frozen`,
        callback,
      );
    });
  });

  describe("subscribeForLeaderboardUnfrozen", () => {
    it("should subscribe to the contest leaderboard unfrozen", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForLeaderboardUnfrozen(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/leaderboard:unfrozen`,
        callback,
      );
    });
  });
});
