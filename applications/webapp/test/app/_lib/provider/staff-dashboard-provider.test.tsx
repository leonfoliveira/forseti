import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { StaffDashboardProvider } from "@/app/_lib/provider/staff-dashboard-provider";
import { staffDashboardSlice } from "@/app/_store/slices/staff-dashboard-slice";
import {
  announcementListener,
  clarificationListener,
  dashboardReader,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
  ticketListener,
} from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardPartialResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardPartialResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
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
  const contestMetadata = MockContestMetadataResponseDTO();
  const contest = MockContestPublicResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();
  const submissions = [
    MockSubmissionPublicResponseDTO(),
    MockSubmissionPublicResponseDTO(),
  ];
  const tickets = [MockTicketResponseDTO()];
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (dashboardReader.getStaff as jest.Mock).mockResolvedValue({
      contest,
      leaderboard,
      submissions,
      tickets,
    });
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    expect(dashboardReader.getStaff).toHaveBeenCalledWith(contestMetadata.id);

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
    expect(
      leaderboardListener.subscribeForLeaderboardPartial,
    ).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(
      leaderboardListener.subscribeForLeaderboardFreeze,
    ).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(
      leaderboardListener.subscribeForLeaderboardUnfreeze,
    ).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(ticketListener.subscribeForContest).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );

    const state = store.getState().staffDashboard;
    expect(state).toEqual({
      contest,
      leaderboard,
      submissions,
      tickets,
      listenerStatus: ListenerStatus.CONNECTED,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (dashboardReader.getStaff as jest.Mock).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    const state = store.getState().staffDashboard;
    expect(state).toEqual({ listenerStatus: ListenerStatus.DISCONNECTED });

    expect(screen.queryByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should handle leaderboard partial updates", async () => {
    const leaderboardPartial = MockLeaderboardPartialResponseDTO({
      memberId: leaderboard.members[0].id,
      problemId: leaderboard.members[0].problems[0].id,
      isAccepted: !leaderboard.members[0].problems[0].isAccepted,
    });
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardPartial as jest.Mock
      ).mock.calls[0][2](leaderboardPartial);
    });
    expect(
      store.getState().staffDashboard.leaderboard.members[0].problems[0]
        .isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardFreeze as jest.Mock
      ).mock.calls[0][2]();
    });
    expect(store.getState().staffDashboard.leaderboard.isFrozen).toBe(true);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const frozenSubmissions = [MockSubmissionPublicResponseDTO()];
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardUnfreeze as jest.Mock
      ).mock.calls[0][2]({ leaderboard: otherLeaderboard, frozenSubmissions });
    });
    expect(store.getState().staffDashboard.leaderboard).toBe(otherLeaderboard);
    expect(store.getState().staffDashboard.submissions).toContain(
      frozenSubmissions[0],
    );
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO();
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherSubmission,
      );
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
      { session, contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(store.getState().staffDashboard.contest.announcements).toContain(
      otherAnnouncement,
    );
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: contest.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(
      store.getState().staffDashboard.contest.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: contest.clarifications[0].id });
    });
    expect(store.getState().staffDashboard.contest.clarifications).toHaveLength(
      0,
    );
  });

  it("should handle ticket updates", async () => {
    const otherTicket = MockTicketResponseDTO({
      id: uuidv4(),
    });
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (ticketListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherTicket,
      );
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
      { session, contestMetadata },
    );

    act(() => {
      (ticketListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherTicket,
      );
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
      { session, contestMetadata },
    );

    act(() => {
      (ticketListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherTicket,
      );
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should show freeze banner if leaderboard is frozen", async () => {
    const { store } = await renderWithProviders(
      <StaffDashboardProvider>
        <div data-testid="child" />
      </StaffDashboardProvider>,
      { session, contestMetadata },
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
      { session, contestMetadata },
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
