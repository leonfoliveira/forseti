import {
  act,
  renderHook,
  RenderHookResult,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  ContestantContextProvider,
  useContestantContext,
} from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { mockAlert, mockToast, mockUseAuthorization } from "@/test/jest.setup";
import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
    id: "test-contest-id",
  })),
}));
jest.mock("@/app/_util/contest-formatter-hook", () => ({
  useContestFormatter: jest.fn(() => ({
    formatSubmissionAnswer: jest.fn((answer) => answer),
  })),
}));
jest.mock("@/app/_component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/app/_component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("ContestantContextProvider", () => {
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

    renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>
          <span data-testid="child" />
          {children}
        </ContestantContextProvider>
      ),
    });

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockAlert.error).toHaveBeenCalledWith("error");
      expect(screen.getByTestId("error")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });

  it("should load contest data and render children", async () => {
    const mockContest = { id: "test-contest-id", name: "Test Contest" };
    const mockLeaderboard = { id: "test-leaderboard-id" };
    const mockSubmissions = [{ id: "submission-1" }];
    const mockMemberSubmissions = [{ id: "member-submission-1" }];

    (contestService.findContestById as jest.Mock).mockResolvedValue(
      mockContest,
    );
    (contestService.findContestLeaderboardById as jest.Mock).mockResolvedValue(
      mockLeaderboard,
    );
    (contestService.findAllContestSubmissions as jest.Mock).mockResolvedValue(
      mockSubmissions,
    );
    (submissionService.findAllFullForMember as jest.Mock).mockResolvedValue(
      mockMemberSubmissions,
    );

    const { result } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>
          <span data-testid="child" />
          {children}
        </ContestantContextProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.contest).toEqual(mockContest);
      expect(result.current.leaderboard).toEqual(mockLeaderboard);
      expect(result.current.submissions).toEqual(mockSubmissions);
      expect(result.current.memberSubmissions).toEqual(mockMemberSubmissions);
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  it("should connect and disconnect to listener", async () => {
    const { unmount } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    unmount();
    expect(listenerClient.disconnect).toHaveBeenCalled();
  });

  it("should handle leaderboard updates", async () => {
    const { result } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
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
    (contestService.findAllContestSubmissions as jest.Mock).mockResolvedValue(
      [],
    );

    const { result } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      submissionListener.subscribeForContest as jest.Mock,
    ).toHaveBeenCalledWith(
      listenerClient,
      "test-contest-id",
      expect.any(Function),
    );
    const receiveSubmission = (
      submissionListener.subscribeForContest as jest.Mock
    ).mock.calls[0][2];
    const newSubmission = { id: "new-submission-id" };
    act(() => {
      receiveSubmission(newSubmission);
    });
    expect(result.current.submissions).toContainEqual(newSubmission);
  });

  it.each([
    [SubmissionAnswer.ACCEPTED, mockToast.success],
    [SubmissionAnswer.WRONG_ANSWER, mockToast.error],
    [SubmissionAnswer.TIME_LIMIT_EXCEEDED, mockToast.info],
    [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED, mockToast.info],
    [SubmissionAnswer.RUNTIME_ERROR, mockToast.warning],
    [SubmissionAnswer.COMPILATION_ERROR, mockToast.warning],
  ])(
    "should handle member submission updates with status %s",
    async (answer, toast) => {
      (submissionService.findAllFullForMember as jest.Mock).mockResolvedValue(
        [],
      );

      const { result } = renderHook(() => useContestantContext(), {
        wrapper: ({ children }) => (
          <ContestantContextProvider>{children}</ContestantContextProvider>
        ),
      });

      await waitFor(() => {
        expect(listenerClient.connect).toHaveBeenCalled();
      });

      expect(
        submissionListener.subscribeForMember as jest.Mock,
      ).toHaveBeenCalledWith(listenerClient, "member-id", expect.any(Function));
      const receiveMemberSubmission = (
        submissionListener.subscribeForMember as jest.Mock
      ).mock.calls[0][2];
      const newMemberSubmission = {
        id: "new-member-submission-id",
        answer,
        problem: {},
      };
      act(() => {
        receiveMemberSubmission(newMemberSubmission);
      });
      expect(result.current.memberSubmissions).toContainEqual(
        newMemberSubmission,
      );
      expect(toast).toHaveBeenCalledWith("submission-toast-problem");
    },
  );

  it("should handle announcement updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      announcements: [],
    });

    const { result } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
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
    expect(mockAlert.warning).toHaveBeenCalledWith(newAnnouncement.text);
  });

  it("should handle clarification updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [],
    });

    const { result } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
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

  it("should handle clarification answer updates", async () => {
    renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
      ),
    });

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      clarificationListener.subscribeForMemberChildren,
    ).toHaveBeenCalledWith(listenerClient, "member-id", expect.any(Function));
    const receiveClarificationAnswer = (
      clarificationListener.subscribeForMemberChildren as jest.Mock
    ).mock.calls[0][2];
    const newClarificationAnswer = {
      text: "Clarification Answer",
    };
    act(() => {
      receiveClarificationAnswer(newClarificationAnswer);
    });
    expect(mockToast.info).toHaveBeenCalledWith("clarification-answer");
  });

  it("should handle clarification deletion", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [{ id: "clarification-id" }],
    });

    const { result } = renderHook(() => useContestantContext(), {
      wrapper: ({ children }) => (
        <ContestantContextProvider>{children}</ContestantContextProvider>
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
