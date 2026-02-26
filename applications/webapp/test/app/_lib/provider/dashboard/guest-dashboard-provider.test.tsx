import { screen } from "@testing-library/dom";
import { act } from "react";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { GuestDashboardProvider } from "@/app/_lib/provider/dashboard/guest-dashboard-provider";
import { guestDashboardSlice } from "@/app/_store/slices/dashboard/guest-dashboard-slice";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/dashboard/MockGuestDashboardResponseDTO";
import { MockLeaderboardCellResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardCellResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionResponseDTO } from "@/test/mock/response/submission/MockSubmissionResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/app/_lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

describe("GuestDashboardProvider", () => {
  const contest = MockContestResponseDTO();
  const dashboard = MockGuestDashboardResponseDTO();

  beforeEach(() => {
    (
      Composition.dashboardReader.getGuestDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    expect(Composition.dashboardReader.getGuestDashboard).toHaveBeenCalledWith(
      contest.id,
    );

    expect(Composition.broadcastClient.connect).toHaveBeenCalled();
    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    expect(room.name).toBe(`/contests/${contest.id}/dashboard/guest`);

    const state = store.getState().guestDashboard;
    expect(state).toEqual({
      ...dashboard,
      listenerStatus: ListenerStatus.CONNECTED,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (
      Composition.dashboardReader.getGuestDashboard as jest.Mock
    ).mockRejectedValue(error);
    await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    expect(screen.queryByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should handle leaderboard partial updates", async () => {
    const leaderboardPartial = MockLeaderboardCellResponseDTO({
      memberId: dashboard.leaderboard.rows[0].memberId,
      problemId: dashboard.leaderboard.rows[0].cells[0].problemId,
      isAccepted: !dashboard.leaderboard.rows[0].cells[0].isAccepted,
    });
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_UPDATED(leaderboardPartial);
    });
    expect(
      store.getState().guestDashboard.leaderboard.rows[0].cells[0].isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_FROZEN();
    });
    expect(store.getState().guestDashboard.leaderboard.isFrozen).toBe(true);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const frozenSubmissions = [MockSubmissionResponseDTO()];
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_UNFROZEN({
        leaderboard: otherLeaderboard,
        frozenSubmissions,
      });
    });
    expect(store.getState().guestDashboard.leaderboard).toBe(otherLeaderboard);
    expect(store.getState().guestDashboard.submissions).toContain(
      frozenSubmissions[0],
    );
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionResponseDTO();
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.SUBMISSION_CREATED(otherSubmission);
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
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.ANNOUNCEMENT_CREATED(otherAnnouncement);
    });
    expect(store.getState().guestDashboard.announcements).toContain(
      otherAnnouncement,
    );
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: dashboard.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_CREATED(otherClarification);
    });
    expect(
      store.getState().guestDashboard.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_DELETED({
        id: dashboard.clarifications[0].id,
      });
    });
    expect(store.getState().guestDashboard.clarifications).toHaveLength(0);
  });

  it("should show freeze banner if leaderboard is frozen", async () => {
    const { store } = await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    act(() => {
      store.dispatch(guestDashboardSlice.actions.setLeaderboardIsFrozen(true));
    });

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });

  it("should show disconnection banner if listener status is LOST_CONNECTION", async () => {
    (Composition.broadcastClient.connect as jest.Mock).mockRejectedValueOnce(
      new Error("Connection failed"),
    );
    await renderWithProviders(
      <GuestDashboardProvider>
        <div data-testid="child" />
      </GuestDashboardProvider>,
      { contest },
    );

    expect(
      await screen.findByTestId("disconnection-banner"),
    ).toBeInTheDocument();
  });
});
