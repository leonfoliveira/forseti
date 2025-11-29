import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";

import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  leaderboardService,
  listenerClientFactory,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { GuestDashboardProvider } from "@/lib/provider/guest-dashboard-provider";
import { useToast } from "@/lib/util/toast-hook";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

describe("GuestDashboardProvider", () => {
  const contestMetadata = MockContestMetadataResponseDTO();
  const contest = MockContestPublicResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();
  const submissions = [
    MockSubmissionPublicResponseDTO(),
    MockSubmissionPublicResponseDTO(),
  ];
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (contestService.findContestById as jest.Mock).mockResolvedValue(contest);
    (leaderboardService.findContestLeaderboard as jest.Mock).mockResolvedValue(
      leaderboard,
    );
    (
      submissionService.findAllContestSubmissions as jest.Mock
    ).mockResolvedValue(submissions);
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    expect(contestService.findContestById).toHaveBeenCalledWith(
      contestMetadata.id,
    );
    expect(leaderboardService.findContestLeaderboard).toHaveBeenCalledWith(
      contestMetadata.id,
    );
    expect(submissionService.findAllContestSubmissions).toHaveBeenCalledWith(
      contestMetadata.id,
    );

    expect(leaderboardListener.subscribeForLeaderboard).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(submissionListener.subscribeForContest).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(announcementListener.subscribeForContest).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(clarificationListener.subscribeForContest).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(
      clarificationListener.subscribeForContestDeleted,
    ).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );

    const state = store.getState().guestDashboard;
    expect(state).toEqual({
      contest,
      leaderboard,
      submissions,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (contestService.findContestById as jest.Mock).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    const state = store.getState().guestDashboard;
    expect(state).toBeNull();

    expect(screen.queryByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should handle leaderboard updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboard as jest.Mock
      ).mock.calls[0][2](otherLeaderboard);
    });
    expect(store.getState().guestDashboard.leaderboard).toBe(otherLeaderboard);
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO();
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherSubmission,
      );
    });
    expect(store.getState().guestDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should handle announcements update", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO();
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(store.getState().guestDashboard.contest.announcements).toContain(
      otherAnnouncement,
    );
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: contest.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(
      store.getState().guestDashboard.contest.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: contest.clarifications[0].id });
    });
    expect(store.getState().guestDashboard.contest.clarifications).toHaveLength(
      0,
    );
  });
});
