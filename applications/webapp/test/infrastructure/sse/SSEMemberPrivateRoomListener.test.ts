import { SSEMemberPrivateRoomListener } from "@/infrastructure/sse/SSEMemberPrivateRoomListener";
import { eventSource } from "@/test/jest.setup";

describe("SSEMemberPrivateRoomListener", () => {
  const listener = new SSEMemberPrivateRoomListener("http://localhost:8080");

  it("should subscribe to SSE", async () => {
    const contestId = "contest-1";
    const listeners = {
      SUBMISSION_UPDATED: jest.fn(),
      CLARIFICATION_ANSWERED: jest.fn(),
    };
    const onDisconnect = jest.fn();
    const onReconnect = jest.fn();

    const promise = listener.subscribe(
      contestId,
      listeners,
      onDisconnect,
      onReconnect,
    );
    eventSource.onopen();
    await promise;

    for (const listener in listeners) {
      expect(eventSource.addEventListener).toHaveBeenCalledWith(
        listener,
        expect.any(Function),
      );
    }

    eventSource.onerror("error");
    expect(onDisconnect).toHaveBeenCalled();

    eventSource.onopen();
    expect(onReconnect).toHaveBeenCalled();
  });
});
