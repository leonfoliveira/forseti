import { SSEAdminDashboardRoomListener } from "@/infrastructure/sse/SSEAdminDashboardRoomListener";
import { eventSource } from "@/test/jest.setup";

describe("SSEAdminDashboardRoomListener", () => {
  const listener = new SSEAdminDashboardRoomListener("http://localhost:8080");

  it("should subscribe to SSE", async () => {
    const contestId = "contest-1";
    const listeners = {
      LEADERBOARD_UPDATED: jest.fn(),
      SUBMISSION_CREATED: jest.fn(),
      SUBMISSION_UPDATED: jest.fn(),
      ANNOUNCEMENT_CREATED: jest.fn(),
      CLARIFICATION_CREATED: jest.fn(),
      CLARIFICATION_ANSWERED: jest.fn(),
      CLARIFICATION_PUBLISHED: jest.fn(),
      CONTEST_FROZEN: jest.fn(),
      CONTEST_UNFROZEN: jest.fn(),
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
