import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { StompAnnouncementListener } from "@/infrastructure/adapter/stomp/StompAnnouncementListener";

describe("StompAnnouncementListener", () => {
  const sut = new StompAnnouncementListener();

  const contestId = uuidv4();

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
