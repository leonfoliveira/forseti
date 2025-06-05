import { StompConnector } from "@/adapter/stomp/StompConnector";
import { CompatClient, IFrame, Stomp } from "@stomp/stompjs";
import { ServerException } from "@/core/domain/exception/ServerException";
import { spyOn } from "jest-mock";

jest.mock("sockjs-client");
jest.mock("@stomp/stompjs");

describe("StompClient", () => {
  let stompClient: StompConnector;
  let mockCompatClient: jest.Mocked<CompatClient>;

  beforeEach(() => {
    stompClient = new StompConnector("http://example.com/ws");
    mockCompatClient = {
      connected: true,
      activate: jest.fn(),
      deactivate: jest.fn(),
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
      onStompError: jest.fn(),
    } as unknown as jest.Mocked<CompatClient>;

    spyOn(Stomp, "over").mockReturnValue(mockCompatClient);
  });

  describe("connect", () => {
    it("resolves with the client when connection is successful", async () => {
      const promise = stompClient.connect();
      mockCompatClient.onConnect({} as unknown as IFrame);
      const result = await promise;

      expect(result).toBe(mockCompatClient);
      expect(mockCompatClient.activate).toHaveBeenCalled();
    });

    it("rejects with a ServerException when a STOMP error occurs", async () => {
      const promise = stompClient.connect();
      mockCompatClient.onStompError({
        headers: { message: "STOMP error occurred" },
      } as unknown as IFrame);

      await expect(promise).rejects.toThrow(ServerException);
      await expect(promise).rejects.toThrow("STOMP error occurred");
    });

    it("rejects with a ServerException with a default message if no error message is provided", async () => {
      const promise = stompClient.connect();
      mockCompatClient.onStompError({ headers: {} } as unknown as IFrame);

      await expect(promise).rejects.toThrow(ServerException);
      await expect(promise).rejects.toThrow("Unknown STOMP error");
    });
  });

  describe("disconnect", () => {
    it("resolves when the client is successfully disconnected", async () => {
      const promise = stompClient.disconnect(mockCompatClient);
      mockCompatClient.onDisconnect({} as unknown as IFrame);
      await promise;

      expect(mockCompatClient.deactivate).toHaveBeenCalled();
    });
  });
});
