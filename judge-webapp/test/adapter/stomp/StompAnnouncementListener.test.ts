import { randomUUID } from "crypto";

import { mock } from "jest-mock-extended";

import { StompAnnouncementListener } from "@/adapter/stomp/StompAnnouncementListener";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

describe("StompAnnouncementListener", () => {
  const sut = new StompAnnouncementListener();

  const contestId = randomUUID();

  describe("subscribeForContest", () => {
    it("should subscribe to contest announcements", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForContest(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/announcements`,
        callback,
      );
    });
  });
});
