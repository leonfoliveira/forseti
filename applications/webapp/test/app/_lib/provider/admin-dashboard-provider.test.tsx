import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { AdminDashboardProvider } from "@/app/_lib/provider/admin-dashboard-provider";
import {
  announcementListener,
  clarificationListener,
  dashboardReader,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockLeaderboardPartialResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardPartialResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/app/_lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));
jest.mock("@/app/_lib/component/feedback/disconnection-alert", () => ({
  DisconnectionAlert: () => <span data-testid="disconnection-alert" />,
}));

describe("AdminDashboardProvider", () => {
  const session = MockSession();
  const contestMetadata = MockContestMetadataResponseDTO();
  const contest = MockContestFullResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();
  const submissions = [
    MockSubmissionFullResponseDTO(),
    MockSubmissionFullResponseDTO(),
  ];
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (dashboardReader.getAdmin as jest.Mock).mockResolvedValue({
      contest,
      leaderboard,
      submissions,
    });
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    expect(dashboardReader.getAdmin).toHaveBeenCalledWith(contestMetadata.id);

    expect(leaderboardListener.subscribeForLeaderboard).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(submissionListener.subscribeForContestFull).toHaveBeenCalledWith(
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

    const state = store.getState().adminDashboard;
    expect(state).toEqual({
      contest,
      leaderboard,
      submissions,
      listenerStatus: ListenerStatus.CONNECTED,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (dashboardReader.getAdmin as jest.Mock).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    const state = store.getState().adminDashboard;
    expect(state).toEqual({ listenerStatus: ListenerStatus.DISCONNECTED });

    expect(screen.queryByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should handle leaderboard updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboard as jest.Mock
      ).mock.calls[0][2](otherLeaderboard);
    });
    expect(store.getState().adminDashboard.leaderboard).toBe(otherLeaderboard);
  });

  it("should handle leaderboard partial updates", async () => {
    const leaderboardPartial = MockLeaderboardPartialResponseDTO({
      memberId: leaderboard.members[0].id,
      problemId: leaderboard.members[0].problems[0].id,
      isAccepted: !leaderboard.members[0].problems[0].isAccepted,
    });
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardPartial as jest.Mock
      ).mock.calls[0][2](leaderboardPartial);
    });
    expect(
      store.getState().adminDashboard.leaderboard.members[0].problems[0]
        .isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardFreeze as jest.Mock
      ).mock.calls[0][2]({
        leaderboard: MockLeaderboardResponseDTO(),
        frozenSubmissions: [],
      });
    });
    expect(store.getState().adminDashboard.leaderboard.isFrozen).toBe(true);
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardUnfreeze as jest.Mock
      ).mock.calls[0][2]({
        leaderboard: otherLeaderboard,
        frozenSubmissions: [],
      });
    });
    expect(store.getState().adminDashboard.leaderboard).toBe(otherLeaderboard);
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionFullResponseDTO();
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        submissionListener.subscribeForContestFull as jest.Mock
      ).mock.calls[0][2](otherSubmission);
    });
    expect(store.getState().adminDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should show a toast for failed submissions", async () => {
    const otherSubmission = MockSubmissionFullResponseDTO({
      status: SubmissionStatus.FAILED,
    });
    await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        submissionListener.subscribeForContestFull as jest.Mock
      ).mock.calls[0][2](otherSubmission);
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle announcements update", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO({
      member: session.member,
    });
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(store.getState().adminDashboard.contest.announcements).toContain(
      otherAnnouncement,
    );
  });

  it("should show a toast for announcements not owned by member", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO({
      member: { ...MockAnnouncementResponseDTO().member, id: uuidv4() },
    });
    await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: contest.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(
      store.getState().adminDashboard.contest.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should show toast for clarifications without parent", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });
    await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: contest.clarifications[0].id });
    });
    expect(store.getState().adminDashboard.contest.clarifications).toHaveLength(
      0,
    );
  });
});
