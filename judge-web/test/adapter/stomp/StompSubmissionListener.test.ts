import { StompSubmissionListener } from "@/adapter/stomp/StompSubmissionListener";
import { StompClient } from "@/adapter/stomp/StompClient";
import { CompatClient, IMessage } from "@stomp/stompjs";
import { mock, MockProxy } from "jest-mock-extended";
import { spyOn } from "jest-mock";

jest.mock("@/adapter/stomp/StompClient");

describe("StompSubmissionListener", () => {
  let stompClient: jest.Mocked<StompClient>;
  let stompSubmissionListener: StompSubmissionListener;
  let mockCompatClient: MockProxy<CompatClient>;

  beforeEach(() => {
    stompClient = mock<StompClient>();
    stompSubmissionListener = new StompSubmissionListener(stompClient);
    mockCompatClient = mock<CompatClient>({
      subscribe: jest.fn(),
    });

    stompClient.connect.mockResolvedValue(mockCompatClient);
  });

  describe("subscribeForContest", () => {
    it("subscribes to contest submissions and invokes the callback with parsed submission", async () => {
      const contestId = 1;
      const submission = { id: 123 };
      const message: IMessage = {
        body: JSON.stringify(submission),
      } as IMessage;
      const callback = jest.fn();

      spyOn(mockCompatClient, "subscribe").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_, cb) => cb(message) as any,
      );

      const client = await stompSubmissionListener.subscribeForContest(
        contestId,
        callback,
      );

      expect(stompClient.connect).toHaveBeenCalled();
      expect(mockCompatClient.subscribe).toHaveBeenCalledWith(
        `/topic/contests/${contestId}/submissions`,
        expect.any(Function),
      );
      expect(callback).toHaveBeenCalledWith(submission);
      expect(client).toBe(mockCompatClient);
    });
  });

  describe("subscribeForMember", () => {
    it("subscribes to member submissions and invokes the callback with parsed submission", async () => {
      const memberId = 1;
      const submission = { id: 123 };
      const message: IMessage = {
        body: JSON.stringify(submission),
      } as IMessage;
      const callback = jest.fn();

      spyOn(mockCompatClient, "subscribe").mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_, cb) => cb(message) as any,
      );

      const client = await stompSubmissionListener.subscribeForMember(
        memberId,
        callback,
      );

      expect(stompClient.connect).toHaveBeenCalled();
      expect(mockCompatClient.subscribe).toHaveBeenCalledWith(
        `/topic/members/${memberId}/submissions`,
        expect.any(Function),
      );
      expect(callback).toHaveBeenCalledWith(submission);
      expect(client).toBe(mockCompatClient);
    });
  });

  describe("unsubscribe", () => {
    it("disconnects the client successfully", async () => {
      await stompSubmissionListener.unsubscribe(mockCompatClient);

      expect(stompClient.disconnect).toHaveBeenCalledWith(mockCompatClient);
    });
  });
});
