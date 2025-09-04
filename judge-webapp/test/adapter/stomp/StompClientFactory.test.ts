import { StompClient } from "@/adapter/stomp/StompClient";
import { StompClientFactory } from "@/adapter/stomp/StompClientFactory";

describe("StompClientFactory", () => {
  const wsUrl = "https://example.com/websocket";

  const sut = new StompClientFactory(wsUrl);

  describe("create", () => {
    it("should create a StompClient with the provided WebSocket URL and authorization service", () => {
      const client = sut.create();

      expect(client).toBeInstanceOf(StompClient);
    });
  });
});
