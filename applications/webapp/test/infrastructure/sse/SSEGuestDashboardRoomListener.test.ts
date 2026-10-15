import { SSEGuestDashboardRoomListener } from "@/infrastructure/sse/SSEGuestDashboardRoomListener";
import { eventSource } from "@/test/jest.setup";

describe("SSEGuestDashboardRoomListener", () => {
  const listener = new SSEGuestDashboardRoomListener("http://localhost:8080");

  it("should subscribe to SSE", async () => {
    const contestId = "contest-1";
    const listeners = {
      LEADERBOARD_UPDATED: jest.fn(),
      SUBMISSION_CREATED: jest.fn(),
      SUBMISSION_UPDATED: jest.fn(),
      ANNOUNCEMENT_CREATED: jest.fn(),
      CLARIFICATION_PUBLISHED: jest.fn(),
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

    const data = { foo: "bar" };
    for (const listener in listeners) {
      eventSource.onmessage({
        data: JSON.stringify({ eventName: listener, data }),
      });
      expect(listeners[listener as never]).toHaveBeenCalledWith(data);
    }

    eventSource.onerror("error");
    expect(onDisconnect).toHaveBeenCalled();

    eventSource.onopen();
    expect(onReconnect).toHaveBeenCalled();
  });
});
