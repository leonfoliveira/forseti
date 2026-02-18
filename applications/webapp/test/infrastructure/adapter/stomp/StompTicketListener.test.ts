import { mock } from "jest-mock-extended";
import { v4 as uuidv4 } from "uuid";

import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { StompTicketListener } from "@/infrastructure/adapter/stomp/StompTicketListener";

describe("StompTicketListener", () => {
  const sut = new StompTicketListener();

  const contestId = uuidv4();

  describe("subscribeForContest", () => {
    it("should subscribe to contest tickets", async () => {
      const client = mock<ListenerClient>();
      const callback = jest.fn();

      await sut.subscribeForContest(client, contestId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/tickets`,
        callback,
      );
    });
  });

  describe("subscribeForMember", () => {
    it("should subscribe to member tickets", async () => {
      const client = mock<ListenerClient>();
      const memberId = uuidv4();
      const callback = jest.fn();

      await sut.subscribeForMember(client, contestId, memberId, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/tickets/members/${memberId}`,
        callback,
      );
    });
  });
});
