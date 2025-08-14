
import { mock } from "jest-mock-extended";

import { StompClarificationListener } from "@/adapter/stomp/StompClarificationListener";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

describe("StompClarificationListener", () => {
  const sut = new StompClarificationListener();

  describe("subscribeForContest", () => {
    it("should subscribe to contest clarifications", async () => {
      const client = mock<ListenerClient>();
      const contestId = "contest123";
      const callback = jest.fn();

      await sut.subscribeForContest(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/clarifications`,
        callback
      );
    });
  });

  describe("subscribeForMemberChildren", () => {
    it("should subscribe to member children clarifications", async () => {
      const client = mock<ListenerClient>();
      const memberId = "member123";
      const callback = jest.fn();

      await sut.subscribeForMemberChildren(client, memberId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/members/${memberId}/clarifications/children`,
        callback
      );
    });
  });

  describe("subscribeForContestDeleted", () => {
    it("should subscribe to contest deleted clarifications", async () => {
      const client = mock<ListenerClient>();
      const contestId = "contest123";
      const callback = jest.fn();

      await sut.subscribeForContestDeleted(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/clarifications/deleted`,
        callback
      );
    });
  });
});
