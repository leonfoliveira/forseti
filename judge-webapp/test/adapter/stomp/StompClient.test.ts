import { CompatClient } from "@stomp/stompjs";
import { mock } from "jest-mock-extended";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { StompClient } from "@/adapter/stomp/StompClient";
import { ServerException } from "@/core/domain/exception/ServerException";
import { Authorization } from "@/core/domain/model/Authorization";

describe("StompClient", () => {
  const client = mock<CompatClient>();
  const authorizationService = mock<AuthorizationService>();

  const sut = new StompClient(client, authorizationService);

  describe("connect", () => {
    it("should connect to the STOMP server", async () => {
      Object.defineProperty(client, "connected", {
        value: false,
        writable: true,
      });
      client.onConnect = jest.fn() as any;
      client.onStompError = jest.fn() as any;

      const promise = sut.connect();
      client.onConnect();
      await promise;

      expect(client.activate).toHaveBeenCalled();
    });

    it("should resolve if already connected", async () => {
      Object.defineProperty(client, "connected", {
        value: true,
        writable: true,
      });
      client.onConnect = jest.fn() as any;

      const promise = sut.connect();
      await promise;

      expect(client.activate).not.toHaveBeenCalled();
      expect(client.onConnect).not.toHaveBeenCalled();
    });

    it("should reject on STOMP error", async () => {
      Object.defineProperty(client, "connected", {
        value: false,
        writable: true,
      });
      const error = { headers: { message: "STOMP error" } } as any;
      client.onStompError = jest.fn() as any;

      const promise = sut.connect();
      client.onStompError(error);

      await expect(promise).rejects.toThrow(
        new ServerException(error.headers["message"]),
      );
    });

    it("should reject on STOMP error with default message", async () => {
      Object.defineProperty(client, "connected", {
        value: false,
        writable: true,
      });
      const error = { headers: {} } as any;
      client.onStompError = jest.fn() as any;

      const promise = sut.connect();
      client.onStompError(error);

      await expect(promise).rejects.toThrow(
        new ServerException("Unknown STOMP error"),
      );
    });
  });

  describe("subscribe", () => {
    it("should subscribe to a topic and call the callback with parsed data", () => {
      const topic = "/topic/test";
      const callback = jest.fn();
      const message = { body: JSON.stringify({ key: "value" }) };

      sut.subscribe(topic, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        topic,
        expect.any(Function),
        { Authorization: null },
      );

      const subscriptionCallback = (client.subscribe as jest.Mock).mock
        .calls[0][1];
      subscriptionCallback(message);

      expect(callback).toHaveBeenCalledWith({ key: "value" });
    });

    it("should include authorization header if available", () => {
      const topic = "/topic/test";
      const callback = jest.fn();
      const authorization = {
        accessToken: "token",
      } as unknown as Authorization;
      authorizationService.getAuthorization.mockReturnValue(authorization);

      sut.subscribe(topic, callback);

      expect(client.subscribe).toHaveBeenCalledWith(
        topic,
        expect.any(Function),
        { Authorization: `Bearer ${authorization.accessToken}` },
      );
    });
  });

  describe("disconnect", () => {
    it("should disconnect from the STOMP server", async () => {
      client.onDisconnect = jest.fn() as any;

      const promise = sut.disconnect();
      client.onDisconnect();

      await promise;

      expect(client.deactivate).toHaveBeenCalled();
    });
  });
});
