import { screen } from "@testing-library/dom";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { JudgeDashboardProvider } from "@/app/_lib/provider/dashboard/judge-dashboard-provider";
import { judgeDashboardSlice } from "@/app/_store/slices/dashboard/judge-dashboard-slice";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/dashboard/MockJudgeDashboardResponseDTO";
import { MockLeaderboardCellResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardCellResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/submission/MockSubmissionWithCodeAndExecutionsResponseDTO";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/app/_lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

describe("JudgeDashboardProvider", () => {
  const session = MockSession();
  const contest = MockContestResponseDTO();
  const dashboard = MockJudgeDashboardResponseDTO();

  beforeEach(() => {
    (
      Composition.dashboardReader.getJudgeDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    expect(Composition.dashboardReader.getJudgeDashboard).toHaveBeenCalledWith(
      contest.id,
    );

    expect(Composition.broadcastClient.connect).toHaveBeenCalled();
    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    expect(room.name).toBe(`/contests/${contest.id}/dashboard/judge`);

    const state = store.getState().judgeDashboard;
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
      Composition.dashboardReader.getJudgeDashboard as jest.Mock
    ).mockRejectedValue(error);
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
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
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_UPDATED(leaderboardPartial);
    });
    expect(
      store.getState().judgeDashboard.leaderboard.rows[0].cells[0].isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_FROZEN();
    });
    expect(store.getState().judgeDashboard.leaderboard.isFrozen).toBe(true);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_UNFROZEN(otherLeaderboard);
    });
    expect(store.getState().judgeDashboard.leaderboard).toBe(otherLeaderboard);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionWithCodeAndExecutionsResponseDTO();
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.SUBMISSION_UPDATED(otherSubmission);
    });
    expect(store.getState().judgeDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should show a toast for failed submissions", async () => {
    const otherSubmission = MockSubmissionWithCodeAndExecutionsResponseDTO({
      status: SubmissionStatus.FAILED,
    });
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.SUBMISSION_UPDATED(otherSubmission);
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle announcements update", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO({
      member: session.member,
    });
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.ANNOUNCEMENT_CREATED(otherAnnouncement);
    });
    expect(store.getState().judgeDashboard.announcements).toContain(
      otherAnnouncement,
    );
  });

  it("should show a toast for announcements not owned by member", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO({
      member: { ...MockAnnouncementResponseDTO().member, id: uuidv4() },
    });
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.ANNOUNCEMENT_CREATED(otherAnnouncement);
    });
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: dashboard.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_CREATED(otherClarification);
    });
    expect(
      store.getState().judgeDashboard.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should show toast for clarifications without parent", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_CREATED(otherClarification);
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_DELETED({
        id: dashboard.clarifications[0].id,
      });
    });
    expect(store.getState().judgeDashboard.clarifications).toHaveLength(0);
  });

  it("should handle member ticket updates", async () => {
    const otherTicket = MockTicketResponseDTO();
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.TICKET_UPDATED(otherTicket);
    });
    expect(store.getState().judgeDashboard.memberTickets).toContain(
      otherTicket,
    );
  });

  it("should show toast on announcement creation", async () => {
    const otherTicket = MockTicketResponseDTO({ version: 2 });
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.join as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.ANNOUNCEMENT_CREATED(otherTicket);
    });
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should show freeze banner if leaderboard is frozen", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    act(() => {
      store.dispatch(judgeDashboardSlice.actions.setLeaderboardIsFrozen(true));
    });

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });

  it("should show disconnection banner if listener status is LOST_CONNECTION", async () => {
    (Composition.broadcastClient.connect as jest.Mock).mockRejectedValueOnce(
      new Error("Connection failed"),
    );
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contest },
    );

    expect(
      await screen.findByTestId("disconnection-banner"),
    ).toBeInTheDocument();
  });
});
