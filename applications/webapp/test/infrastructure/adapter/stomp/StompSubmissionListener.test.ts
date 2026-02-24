import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { StompSubmissionListener } from "@/infrastructure/adapter/stomp/StompSubmissionListener";

describe("StompSubmissionListener", () => {
  const sut = new StompSubmissionListener();

  const contestId = uuidv4();

  describe("subscribeForContest", () => {
    it("should subscribe to contest submissions", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForContest(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/submissions`,
        callback,
      );
    });
  });

  describe("subscribeForContestWithCodeAndExecutions", () => {
    it("should subscribe to full contest submissions", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForContestWithCodeAndExecutions(
        client,
        contestId,
        callback,
      );

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/submissions:with-code-and-executions`,
        callback,
      );
    });
  });

  describe("subscribeForMemberWithCode", () => {
    it("should subscribe to member submissions with code", async () => {
      const client = mock<ListenerClient>();
      const memberId = uuidv4();
      const callback = jest.fn();

      await sut.subscribeForMemberWithCode(
        client,
        contestId,
        memberId,
        callback,
      );

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/members/${memberId}/submissions:with-code`,
        callback,
      );
    });
  });
});
