import { randomUUID } from "crypto";

import { mock } from "jest-mock-extended";

import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

describe("StompClarificationListener", () => {
  const sut = new StompClarificationListener();

  const contestId = randomUUID();

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

  describe("subscribeForMemberChildren", () => {
    it("should subscribe to member children clarifications", async () => {
      const client = mock<ListenerClient>();
      const memberId = randomUUID();
      const callback = jest.fn();

      await sut.subscribeForMemberChildren(
        client,
        contestId,
        memberId,
        callback,
      );

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/clarifications/children/members/${memberId}`,
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
        `/topic/contests/${contestId}/clarifications/deleted`,
        callback,
      );
    });
  });
});
