import { act, render, screen, waitFor } from "@testing-library/react";

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
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ContestantDashboardProvider } from "@/lib/provider/contestant-dashboard-provider";
import { contestantDashboardSlice } from "@/store/slices/contestant-dashboard-slice";
import {
  mockAlert,
  mockAppDispatch,
  mockToast,
  mockUseAppSelector,
  mockUseAuthorization,
} from "@/test/jest.setup";

jest.mock("@/lib/provider/contestant-dashboard-provider", () =>
  jest.requireActual("@/lib/provider/contestant-dashboard-provider"),
);
jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading" />,
}));
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error" />,
}));

describe("ContestantDashboardProvider", () => {
  const listenerClient = {
    connect: jest.fn(),
    disconnect: jest.fn(),
  };

  beforeEach(() => {
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
    mockUseAuthorization.mockReturnValue({
      member: { id: "member-id" },
    });
    mockUseAppSelector.mockReturnValue({
      isLoading: false,
      error: null,
    });
  });

  it("should render loading page while loading", async () => {
    mockUseAppSelector.mockReturnValueOnce({
      isLoading: true,
      error: null,
    });

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });

  it("should render error page on load failure", async () => {
    mockUseAppSelector.mockReturnValueOnce({
      isLoading: false,
      error: new Error("error"),
    });
    (contestService.findContestById as jest.Mock).mockRejectedValue(
      new Error("error"),
    );

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toBeInTheDocument();
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
    });
  });

  it("should render children", async () => {
    const mockContest = {
      id: "test-contest-id",
      title: "Test Contest",
    } as unknown as ContestPublicResponseDTO;
    const mockLeaderboard = {
      id: "test-leaderboard-id",
    } as unknown as ContestLeaderboardResponseDTO;
    const mockSubmissions = [
      { id: "submission-1" },
    ] as SubmissionPublicResponseDTO[];
    const mockMemberSubmissions = [
      { id: "member-submission-1" },
    ] as SubmissionFullResponseDTO[];

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

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(mockAppDispatch).toHaveBeenCalledWith(
        contestantDashboardSlice.actions.success({
          contest: mockContest,
          leaderboard: mockLeaderboard,
          submissions: mockSubmissions,
          memberSubmissions: mockMemberSubmissions,
        }),
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  it("should connect and disconnect to listener", async () => {
    const { unmount } = render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    unmount();
    expect(listenerClient.disconnect).toHaveBeenCalled();
  });

  it("should handle leaderboard updates", async () => {
    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      leaderboardListener.subscribeForLeaderboard as jest.Mock,
    ).toHaveBeenCalledWith(listenerClient, "contest", expect.any(Function));
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
      contestantDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );
  });

  it("should handle submission updates", async () => {
    (contestService.findAllContestSubmissions as jest.Mock).mockResolvedValue(
      [],
    );

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      submissionListener.subscribeForContest as jest.Mock,
    ).toHaveBeenCalledWith(listenerClient, "contest", expect.any(Function));
    const receiveSubmission = (
      submissionListener.subscribeForContest as jest.Mock
    ).mock.calls[0][2];
    const newSubmission = {
      id: "new-submission-id",
    } as unknown as SubmissionPublicResponseDTO;
    act(() => {
      receiveSubmission(newSubmission);
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      contestantDashboardSlice.actions.mergeSubmission(newSubmission),
    );
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

      render(
        <ContestantDashboardProvider>
          <span data-testid="child" />
        </ContestantDashboardProvider>,
      );

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
      } as unknown as SubmissionFullResponseDTO;
      act(() => {
        receiveMemberSubmission(newMemberSubmission);
      });
      expect(mockAppDispatch).toHaveBeenCalledWith(
        contestantDashboardSlice.actions.mergeMemberSubmission(
          newMemberSubmission,
        ),
      );
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultMessage: "Problem {letter}: {answer}",
          id: "lib.provider.contestant-dashboard-provider.problem-answer",
        }),
      );
    },
  );

  it("should handle announcement updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      announcements: [],
    });

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      announcementListener.subscribeForContest as jest.Mock,
    ).toHaveBeenCalledWith(listenerClient, "contest", expect.any(Function));
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
      contestantDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );
    expect(mockAlert.warning).toHaveBeenCalledWith({
      defaultMessage: "New announcement: {text}",
      id: "lib.provider.contestant-dashboard-provider.announcement",
      values: { text: "Announcement" },
    });
  });

  it("should handle clarification updates", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [],
    });

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      clarificationListener.subscribeForContest as jest.Mock,
    ).toHaveBeenCalledWith(listenerClient, "contest", expect.any(Function));
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
      contestantDashboardSlice.actions.mergeClarification(newClarification),
    );
  });

  it("should handle clarification answer updates", async () => {
    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

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
    expect(mockToast.info).toHaveBeenCalledWith({
      defaultMessage: "New answer for a clarification",
      id: "lib.provider.contestant-dashboard-provider.clarification-answer",
    });
  });

  it("should handle clarification deletion", async () => {
    (contestService.findContestById as jest.Mock).mockResolvedValue({
      clarifications: [{ id: "clarification-id" }],
    });

    render(
      <ContestantDashboardProvider>
        <span data-testid="child" />
      </ContestantDashboardProvider>,
    );

    await waitFor(() => {
      expect(listenerClient.connect).toHaveBeenCalled();
    });

    expect(
      clarificationListener.subscribeForContestDeleted,
    ).toHaveBeenCalledWith(listenerClient, "contest", expect.any(Function));
    const deleteClarification = (
      clarificationListener.subscribeForContestDeleted as jest.Mock
    ).mock.calls[0][2];
    act(() => {
      deleteClarification({ id: "clarification-id" });
    });
    expect(mockAppDispatch).toHaveBeenCalledWith(
      contestantDashboardSlice.actions.deleteClarification("clarification-id"),
    );
  });
});
