import { act, render, screen, waitFor } from "@testing-library/react";

import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { JudgeContextProvider } from "@/lib/provider/judge-dashboard-provider";
import { judgeDashboardSlice } from "@/store/slices/judge-dashboard-slice";
import {
  mockAlert,
  mockAppDispatch,
  mockUseAuthorization,
  mockUseContestMetadata,
} from "@/test/jest.setup";

jest.mock("@/lib/provider/judge-dashboard-provider", () =>
  jest.requireActual("@/lib/provider/judge-dashboard-provider"),
);
jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("JudgeDashboardProvider", () => {
  const listenerClient = {
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
    mockUseAuthorization.mockReturnValue({
      member: { id: "member-id" },
    });
    mockUseContestMetadata.mockReturnValue({
      id: "test-contest-id",
    });
  });

  it("should alert error and render error page on load failure", async () => {
    (contestService.findContestById as jest.Mock).mockRejectedValue(
      new Error("error"),
    );

    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockAlert.error).toHaveBeenCalledWith({
        defaultMessage: "Error loading contest data",
        id: "lib.provider.judge-dashboard-provider.load-error",
      });
      expect(screen.getByTestId("error")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });

  it("should load contest data and render children", async () => {
    const mockContest = {
      id: "test-contest-id",
      name: "Test Contest",
    } as unknown as ContestPublicResponseDTO;
    const mockLeaderboard = {
      id: "test-leaderboard-id",
    } as unknown as ContestLeaderboardResponseDTO;
    const mockSubmissions = [
      { id: "submission-1" },
    ] as unknown as SubmissionFullResponseDTO[];

    (contestService.findContestById as jest.Mock).mockResolvedValue(
      mockContest,
    );
    (contestService.findContestLeaderboardById as jest.Mock).mockResolvedValue(
      mockLeaderboard,
    );
    (
      contestService.findAllContestFullSubmissions as jest.Mock
    ).mockResolvedValue(mockSubmissions);

    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

    await waitFor(() => {
      expect(mockAppDispatch).toHaveBeenCalledWith(
        judgeDashboardSlice.actions.set({
          contest: mockContest,
          leaderboard: mockLeaderboard,
          submissions: mockSubmissions,
        }),
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  it("should connect and disconnect to listener", async () => {
    const { unmount } = render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    unmount();
    expect(listenerClient.disconnect).toHaveBeenCalled();
  });

  it("should handle leaderboard updates", async () => {
    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

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
    const newLeaderboard = {
      id: "new-leaderboard-id",
    } as unknown as ContestLeaderboardResponseDTO;
    act(() => {
      receiveLeaderboard(newLeaderboard);
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      judgeDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );
  });

  it("should handle submission updates", async () => {
    (
      contestService.findAllContestFullSubmissions as jest.Mock
    ).mockResolvedValue([]);

    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

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
    const newSubmission = {
      id: "new-submission-id",
    } as unknown as SubmissionFullResponseDTO;
    act(() => {
      receiveSubmission(newSubmission);
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      judgeDashboardSlice.actions.mergeSubmission(newSubmission),
    );
  });

  it("should handle announcement updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      announcements: [],
    });

    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

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
    const newAnnouncement = {
      id: "new-announcement-id",
      text: "Announcement",
    } as unknown as AnnouncementResponseDTO;
    act(() => {
      receiveAnnouncement(newAnnouncement);
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      judgeDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage: "New announcement: {text}",
      id: "lib.provider..judge-dashboard-provider.announcement",
      values: { text: "Announcement" },
    });
  });

  it("should handle clarification updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [],
    });

    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

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
    } as unknown as ClarificationResponseDTO;
    act(() => {
      receiveClarification(newClarification);
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      judgeDashboardSlice.actions.mergeClarification(newClarification),
    );
  });

  it("should handle clarification deletion", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [{ id: "clarification-id" }],
    });

    render(
      <JudgeContextProvider>
        <span data-testid="child" />
      </JudgeContextProvider>,
    );

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
    expect(mockAppDispatch).toHaveBeenCalledWith(
      judgeDashboardSlice.actions.deleteClarification("clarification-id"),
    );
  });
});
