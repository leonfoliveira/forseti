import { mock } from "jest-mock-extended";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { StompClientFactory } from "@/adapter/stomp/StompClientFactory";
import { StompClient } from "@/adapter/stomp/StompClient";

describe("StompClientFactory", () => {
  const wsUrl = "https://example.com/websocket";
  const authorizationService = mock<AuthorizationService>();

  const sut = new StompClientFactory(wsUrl, authorizationService);

  describe("create", () => {
    it("should create a StompClient with the provided WebSocket URL and authorization service", () => {
      const client = sut.create();

      expect(client).toBeInstanceOf(StompClient);
    });
  });
});
