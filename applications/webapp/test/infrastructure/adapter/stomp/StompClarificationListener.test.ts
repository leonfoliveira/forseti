import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { StompClarificationListener } from "@/infrastructure/adapter/stomp/StompClarificationListener";

describe("StompClarificationListener", () => {
  const sut = new StompClarificationListener();

  const contestId = uuidv4();

  describe("subscribeForContest", () => {
    it("should subscribe to contest clarifications", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForContest(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/clarifications`,
        callback,
      );
    });
  });

  describe("subscribeForMemberAnswer", () => {
    it("should subscribe to member answer clarifications", async () => {
      const client = mock<ListenerClient>();
      const memberId = uuidv4();
      const callback = jest.fn();

      await sut.subscribeForMemberAnswer(client, contestId, memberId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/members/${memberId}/clarifications:answer`,
        callback,
      );
    });
  });

  describe("subscribeForContestDeleted", () => {
    it("should subscribe to contest deleted clarifications", async () => {
      const client = mock<ListenerClient>();

      const callback = jest.fn();

      await sut.subscribeForContestDeleted(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/clarifications:deleted`,
        callback,
      );
    });
  });
});
