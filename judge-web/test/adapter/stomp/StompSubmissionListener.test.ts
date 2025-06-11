import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { mock } from "jest-mock-extended";
import { StompClient } from "@/adapter/stomp/StompClient";

jest.mock("@/adapter/stomp/StompConnector");
jest.mock("@/adapter/stomp/StompClient");

describe("StompSubmissionListener", () => {
  let stompConnector: jest.Mocked<StompConnector>;
  let mockStompClient: jest.Mocked<StompClient>;
  let stompSubmissionListener: StompSubmissionListener;

  beforeEach(() => {
    stompConnector = mock<StompConnector>();
    mockStompClient = mock<StompClient>();
    (StompClient as jest.Mock).mockImplementation(() => mockStompClient);
    stompSubmissionListener = new StompSubmissionListener(stompConnector);
  });

  describe("subscribeForContest", () => {
    it("subscribes to contest submissions", async () => {
      const contestId = "1";
      const callback = jest.fn();

      await stompSubmissionListener.subscribeForContest(contestId, callback);

      expect(StompClient).toHaveBeenCalledWith(stompConnector);
      expect(mockStompClient.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/submissions`,
        callback,
      );
    });
  });

  describe("unsubscribe", () => {
    it("disconnects the client successfully", async () => {
      await stompSubmissionListener.unsubscribe(mockStompClient);

      expect(mockStompClient.unsubscribe).toHaveBeenCalled();
    });
  });
});
