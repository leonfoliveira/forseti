import { mock, MockProxy } from "jest-mock-extended";
import { CompatClient } from "@stomp/stompjs";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { StompClient } from "@/adapter/stomp/StompClient";

describe("StompClient", () => {
  let stompConnector: MockProxy<StompConnector>;
  let sut: StompClient;

  beforeEach(() => {
    stompConnector = mock<StompConnector>();
    sut = new StompClient(stompConnector);
  });

  describe("subscribe", () => {
    it("subscribes to a topic and invokes the callback with the correct data", async () => {
      const topic = "/topic/example";
      const callback = jest.fn();
      const mockClient = mock<CompatClient>();
      stompConnector.connect.mockResolvedValue(mockClient);

      await sut.subscribe(topic, callback);

      expect(stompConnector.connect).toHaveBeenCalled();
      expect(stompConnector.subscribe).toHaveBeenCalledWith(
        mockClient,
        topic,
        callback,
      );
    });

    it("throws an error if connection fails", async () => {
      const topic = "/topic/example";
      const callback = jest.fn();
      stompConnector.connect.mockRejectedValue(new Error("Connection failed"));

      await expect(sut.subscribe(topic, callback)).rejects.toThrow(
        "Connection failed",
      );

      expect(stompConnector.connect).toHaveBeenCalled();
      expect(stompConnector.subscribe).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("disconnects the client if it is defined", async () => {
      const mockClient = mock<CompatClient>();
      stompConnector.connect.mockResolvedValue(mockClient);
      await sut.subscribe("/topic/example", jest.fn());

      await sut.unsubscribe();

      expect(stompConnector.disconnect).toHaveBeenCalledWith(mockClient);
    });

    it("does nothing if the client is undefined", async () => {
      await sut.unsubscribe();

      expect(stompConnector.disconnect).not.toHaveBeenCalled();
    });
  });
});
