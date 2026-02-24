import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { StaffDashboardProvider } from "@/app/_lib/provider/staff-dashboard-provider";
import { staffDashboardSlice } from "@/app/_store/slices/staff-dashboard-slice";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/dashboard/MockStaffDashboardResponseDTO";
import { MockLeaderboardCellResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardCellResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionResponseDTO } from "@/test/mock/response/submission/MockSubmissionResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/app/_lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

describe("StaffDashboardProvider", () => {
  const session = MockSession();
  const contest = MockContestResponseDTO();
  const dashboard = MockStaffDashboardResponseDTO();
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (
      Composition.dashboardReader.getStaffDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
    (Composition.listenerClientFactory.create as jest.Mock).mockReturnValue(
      listenerClient,
    );
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    expect(Composition.dashboardReader.getStaffDashboard).toHaveBeenCalledWith(
      contest.id,
    );

    expect(
      Composition.submissionListener.subscribeForContest,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(
      Composition.announcementListener.subscribeForContest,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(
      Composition.clarificationListener.subscribeForContest,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(
      Composition.clarificationListener.subscribeForContestDeleted,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(
      Composition.leaderboardListener.subscribeForLeaderboardCell,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(
      Composition.leaderboardListener.subscribeForLeaderboardFrozen,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(
      Composition.leaderboardListener.subscribeForLeaderboardUnfrozen,
    ).toHaveBeenCalledWith(listenerClient, contest.id, expect.any(Function));
    expect(Composition.ticketListener.subscribeForContest).toHaveBeenCalledWith(
      listenerClient,
      contest.id,
      expect.any(Function),
    );

    const state = store.getState().staffDashboard;
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
      Composition.dashboardReader.getStaffDashboard as jest.Mock
    ).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    const state = store.getState().staffDashboard;
    expect(state).toEqual({ listenerStatus: ListenerStatus.DISCONNECTED });

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
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.leaderboardListener.subscribeForLeaderboardCell as jest.Mock
      ).mock.calls[0][2](leaderboardPartial);
    });
    expect(
      store.getState().staffDashboard.leaderboard.rows[0].cells[0].isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.leaderboardListener
          .subscribeForLeaderboardFrozen as jest.Mock
      ).mock.calls[0][2]();
    });
    expect(store.getState().staffDashboard.leaderboard.isFrozen).toBe(true);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const frozenSubmissions = [MockSubmissionResponseDTO()];
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.leaderboardListener
          .subscribeForLeaderboardUnfrozen as jest.Mock
      ).mock.calls[0][2]({ leaderboard: otherLeaderboard, frozenSubmissions });
    });
    expect(store.getState().staffDashboard.leaderboard).toBe(otherLeaderboard);
    expect(store.getState().staffDashboard.submissions).toContain(
      frozenSubmissions[0],
    );
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionResponseDTO();
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.submissionListener.subscribeForContest as jest.Mock
      ).mock.calls[0][2](otherSubmission);
    });
    expect(store.getState().staffDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should handle announcements update", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO();
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.announcementListener.subscribeForContest as jest.Mock
      ).mock.calls[0][2](otherAnnouncement);
    });
    expect(store.getState().staffDashboard.announcements).toContain(
      otherAnnouncement,
    );
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: dashboard.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.clarificationListener.subscribeForContest as jest.Mock
      ).mock.calls[0][2](otherClarification);
    });
    expect(
      store.getState().staffDashboard.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.clarificationListener
          .subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: dashboard.clarifications[0].id });
    });
    expect(store.getState().staffDashboard.clarifications).toHaveLength(0);
  });

  it("should handle ticket updates", async () => {
    const otherTicket = MockTicketResponseDTO({
      id: uuidv4(),
    });
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.ticketListener.subscribeForContest as jest.Mock
      ).mock.calls[0][2](otherTicket);
    });

    expect(store.getState().staffDashboard.tickets).toContain(otherTicket);
  });

  it("should show a toast for new tickets", async () => {
    const otherTicket = MockTicketResponseDTO({
      version: 1,
    });
    await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.ticketListener.subscribeForContest as jest.Mock
      ).mock.calls[0][2](otherTicket);
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should show a toast for ticket updates owned by member", async () => {
    const otherTicket = MockTicketResponseDTO({
      member: session.member,
      version: 2,
    });
    await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      (
        Composition.ticketListener.subscribeForContest as jest.Mock
      ).mock.calls[0][2](otherTicket);
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should show freeze banner if leaderboard is frozen", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      store.dispatch(staffDashboardSlice.actions.setLeaderboardIsFrozen(true));
    });

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });

  it("should show disconnection banner if listener status is LOST_CONNECTION", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contest },
    );

    act(() => {
      store.dispatch(
        staffDashboardSlice.actions.setListenerStatus(
          ListenerStatus.LOST_CONNECTION,
        ),
      );
    });

    expect(screen.getByTestId("disconnection-banner")).toBeInTheDocument();
  });
});
