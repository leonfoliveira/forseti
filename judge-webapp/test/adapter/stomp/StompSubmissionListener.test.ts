
import { mock } from "jest-mock-extended";

import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

describe("StompSubmissionListener", () => {
  const sut = new StompSubmissionListener();

  describe("subscribeForContest", () => {
    it("should subscribe to contest submissions", async () => {
      const client = mock<ListenerClient>();
      const contestId = "contest123";
      const callback = jest.fn();

      await sut.subscribeForContest(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/submissions`,
        callback
      );
    });
  });

  describe("subscribeForContestFull", () => {
    it("should subscribe to full contest submissions", async () => {
      const client = mock<ListenerClient>();
      const contestId = "contest123";
      const callback = jest.fn();

      await sut.subscribeForContestFull(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/submissions/full`,
        callback
      );
    });
  });

  describe("subscribeForMember", () => {
    it("should subscribe to member submissions", async () => {
      const client = mock<ListenerClient>();
      const memberId = "member123";
      const callback = jest.fn();

      await sut.subscribeForMember(client, memberId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/members/${memberId}/submissions`,
        callback
      );
    });
  });
});
