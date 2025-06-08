import { renderHook } from "@testing-library/react";
import { submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { mock } from "jest-mock-extended";
import { useSubscribeForContestSubmissionsAction } from "@/app/_action/subscribe-for-contest-submissions-action";

jest.mock("@/app/_util/action-hook", () => ({
  useAction: jest.fn((fn) => ({
    act: fn,
  })),
}));

jest.mock("@/app/_composition", () => ({
  submissionService: {
    subscribeForContest: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

jest.mock("@/app/_component/alert/alert-provider", () => ({
  useAlert: jest.fn(() => ({
    error: jest.fn(),
  })),
}));

describe("useSubscribeForContestSubmissionsAction", () => {
  const mockContestId = "testContestId";
  const mockAlertError = jest.fn();

  beforeEach(() => {
    (useAlert as jest.Mock).mockReturnValue({
      error: mockAlertError,
    });
  });

  it("should subscribe to submissions and call the callback on new submission", async () => {
    const mockListenerClient = mock<ListenerClient>();
    const callbackFn = jest.fn();

    (submissionService.subscribeForContest as jest.Mock).mockImplementation(
      async (contestId, cb) => {
        cb();
        return mockListenerClient;
      },
    );

    const { result, unmount } = renderHook(() =>
      useSubscribeForContestSubmissionsAction(),
    );
    await result.current.act(mockContestId, callbackFn);

    expect(submissionService.subscribeForContest).toHaveBeenCalledWith(
      mockContestId,
      callbackFn,
    );

    unmount();
    expect(submissionService.unsubscribe).toHaveBeenCalledWith(
      mockListenerClient,
    );
  });

  it("should display an error alert if subscription fails", async () => {
    const mockError = new Error("Subscription failed");
    (submissionService.subscribeForContest as jest.Mock).mockRejectedValue(
      mockError,
    );

    const { result } = renderHook(() =>
      useSubscribeForContestSubmissionsAction(),
    );
    await result.current.act("abc", jest.fn());

    expect(submissionService.subscribeForContest).toHaveBeenCalledWith(
      mockContestId,
      expect.any(Function),
    );
    expect(mockAlertError).toHaveBeenCalledWith(
      "Error subscribing to submissions",
    );
  });
});
