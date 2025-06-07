import { StompConnector } from "@/adapter/stomp/StompConnector";
import { CompatClient, IFrame, IMessage, Stomp } from "@stomp/stompjs";
import { ServerException } from "@/core/domain/exception/ServerException";
import { spyOn } from "jest-mock";
import { AuthorizationService } from "@/core/service/AuthorizationService";
import { any, anyFunction, mock } from "jest-mock-extended";
import { Authorization } from "@/core/domain/model/Authorization";

jest.mock("sockjs-client");
jest.mock("@stomp/stompjs");

describe("StompConnector", () => {
  let mockAuthorizationService: jest.Mocked<AuthorizationService>;
  let stompConnector: StompConnector;
  let mockCompatClient: jest.Mocked<CompatClient>;

  beforeEach(() => {
    mockAuthorizationService = mock<AuthorizationService>();
    stompConnector = new StompConnector(
      "http://example.com/ws",
      mockAuthorizationService,
    );
    mockCompatClient = {
      connected: true,
      activate: jest.fn(),
      deactivate: jest.fn(),
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
      onStompError: jest.fn(),
      subscribe: jest.fn(),
    } as unknown as jest.Mocked<CompatClient>;

    spyOn(Stomp, "over").mockReturnValue(mockCompatClient);
  });

  describe("connect", () => {
    it("resolves with the client when connection is successful", async () => {
      const promise = stompConnector.connect();
      mockCompatClient.onConnect({} as unknown as IFrame);
      const result = await promise;

      expect(result).toBe(mockCompatClient);
      expect(mockCompatClient.activate).toHaveBeenCalled();
    });

    it("rejects with a ServerException when a STOMP error occurs", async () => {
      const promise = stompConnector.connect();
      mockCompatClient.onStompError({
        headers: { message: "STOMP error occurred" },
      } as unknown as IFrame);

      await expect(promise).rejects.toThrow(ServerException);
      await expect(promise).rejects.toThrow("STOMP error occurred");
    });

    it("rejects with a ServerException with a default message if no error message is provided", async () => {
      const promise = stompConnector.connect();
      mockCompatClient.onStompError({ headers: {} } as unknown as IFrame);

      await expect(promise).rejects.toThrow(ServerException);
      await expect(promise).rejects.toThrow("Unknown STOMP error");
    });
  });

  describe("subscribe", () => {
    it("subscribes to a topic and calls the callback with parsed data", async () => {
      const topic = "/topic/test";
      const callback = jest.fn();
      const accessToken = "token";
      mockAuthorizationService.getAuthorization.mockReturnValue({
        accessToken,
      } as unknown as Authorization);

      await stompConnector.subscribe(mockCompatClient, topic, callback);
      const onMessage = mockCompatClient.subscribe.mock.calls[0][1];
      onMessage({ body: '{"foo": "bar"}' } as unknown as IMessage);

      expect(mockCompatClient.subscribe).toHaveBeenCalledWith(
        topic,
        anyFunction(),
        {
          Authorization: `Bearer ${accessToken}`,
        },
      );
      expect(callback).toHaveBeenCalledWith({ foo: "bar" });
    });
  });

  describe("disconnect", () => {
    it("resolves when the client is successfully disconnected", async () => {
      const promise = stompConnector.disconnect(mockCompatClient);
      mockCompatClient.onDisconnect({} as unknown as IFrame);
      await promise;

      expect(mockCompatClient.deactivate).toHaveBeenCalled();
    });
  });
});
