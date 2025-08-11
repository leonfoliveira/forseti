import { act, renderHook, screen, waitFor } from "@testing-library/react";

import {
  JudgeContextProvider,
  useJudgeContext,
} from "@/app/contests/[slug]/judge/_context/judge-context";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { mockAlert, mockUseAuthorization } from "@/test/jest.setup";

jest.mock("@/store/slices/contest-slice", () => ({
  useContest: jest.fn(() => ({
    id: "test-contest-id",
  })),
}));
jest.mock("@/app/_component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/app/_component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("JudgeContextProvider", () => {
  const listenerClient = {
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
    mockUseAuthorization.mockReturnValue({
      member: { id: "member-id" },
    });
  });

  it("should alert error and render error page on load failure", async () => {
    (contestService.findContestById as jest.Mock).mockRejectedValue(
      new Error("error"),
    );

    renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>
          <span data-testid="child" />
          {children}
        </JudgeContextProvider>
      ),
    });

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockAlert.error).toHaveBeenCalledWith({
        defaultMessage: "Error loading contest data",
        id: "app.contests.[slug].judge._context.judge-context.load-error",
      });
      expect(screen.getByTestId("error")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });

  it("should load contest data and render children", async () => {
    const mockContest = { id: "test-contest-id", name: "Test Contest" };
    const mockLeaderboard = { id: "test-leaderboard-id" };
    const mockSubmissions = [{ id: "submission-1" }];

    (contestService.findContestById as jest.Mock).mockResolvedValue(
      mockContest,
    );
    (contestService.findContestLeaderboardById as jest.Mock).mockResolvedValue(
      mockLeaderboard,
    );
    (
      contestService.findAllContestFullSubmissions as jest.Mock
    ).mockResolvedValue(mockSubmissions);

    const { result } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>
          <span data-testid="child" />
          {children}
        </JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.contest).toEqual(mockContest);
      expect(result.current.leaderboard).toEqual(mockLeaderboard);
      expect(result.current.submissions).toEqual(mockSubmissions);
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  it("should connect and disconnect to listener", async () => {
    const { unmount } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>{children}</JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    unmount();
    expect(listenerClient.disconnect).toHaveBeenCalled();
  });

  it("should handle leaderboard updates", async () => {
    const { result } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>{children}</JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      leaderboardListener.subscribeForLeaderboard as jest.Mock,
    ).toHaveBeenCalledWith(
      listenerClient,
      "test-contest-id",
      expect.any(Function),
    );
    const receiveLeaderboard = (
      leaderboardListener.subscribeForLeaderboard as jest.Mock
    ).mock.calls[0][2];
    const newLeaderboard = { id: "new-leaderboard-id" };
    act(() => {
      receiveLeaderboard(newLeaderboard);
    });
    expect(result.current.leaderboard).toEqual(newLeaderboard);
  });

  it("should handle submission updates", async () => {
    (
      contestService.findAllContestFullSubmissions as jest.Mock
    ).mockResolvedValue([]);

    const { result } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>{children}</JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      submissionListener.subscribeForContestFull as jest.Mock,
    ).toHaveBeenCalledWith(
      listenerClient,
      "test-contest-id",
      expect.any(Function),
    );
    const receiveSubmission = (
      submissionListener.subscribeForContestFull as jest.Mock
    ).mock.calls[0][2];
    const newSubmission = { id: "new-submission-id" };
    act(() => {
      receiveSubmission(newSubmission);
    });
    expect(result.current.submissions).toContainEqual(newSubmission);
  });

  it("should handle announcement updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      announcements: [],
    });

    const { result } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>{children}</JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      announcementListener.subscribeForContest as jest.Mock,
    ).toHaveBeenCalledWith(
      listenerClient,
      "test-contest-id",
      expect.any(Function),
    );
    const receiveAnnouncement = (
      announcementListener.subscribeForContest as jest.Mock
    ).mock.calls[0][2];
    const newAnnouncement = { id: "new-announcement-id", text: "Announcement" };
    act(() => {
      receiveAnnouncement(newAnnouncement);
    });
    expect(result.current.contest.announcements).toContainEqual(
      newAnnouncement,
    );
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage: "New announcement: {text}",
      id: "app.contests.[slug].judge._context.judge-context.announcement",
      values: { text: "Announcement" },
    });
  });

  it("should handle clarification updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [],
    });

    const { result } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>{children}</JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      clarificationListener.subscribeForContest as jest.Mock,
    ).toHaveBeenCalledWith(
      listenerClient,
      "test-contest-id",
      expect.any(Function),
    );
    const receiveClarification = (
      clarificationListener.subscribeForContest as jest.Mock
    ).mock.calls[0][2];
    const newClarification = {
      id: "new-clarification-id",
      text: "Clarification",
    };
    act(() => {
      receiveClarification(newClarification);
    });
    expect(result.current.contest.clarifications).toContainEqual(
      newClarification,
    );
  });

  it("should handle clarification deletion", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [{ id: "clarification-id" }],
    });

    const { result } = renderHook(() => useJudgeContext(), {
      wrapper: ({ children }) => (
        <JudgeContextProvider>{children}</JudgeContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      clarificationListener.subscribeForContestDeleted,
    ).toHaveBeenCalledWith(
      listenerClient,
      "test-contest-id",
      expect.any(Function),
    );
    const deleteClarification = (
      clarificationListener.subscribeForContestDeleted as jest.Mock
    ).mock.calls[0][2];
    act(() => {
      deleteClarification({ id: "clarification-id" });
    });
    expect(result.current.contest.clarifications).not.toContainEqual(
      expect.objectContaining({ id: "clarification-id" }),
    );
  });
});
