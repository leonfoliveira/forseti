import { screen } from "@testing-library/dom";
import { act } from "react";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { ContestantDashboardProvider } from "@/app/_lib/provider/contestant-dashboard-provider";
import { contestantDashboardSlice } from "@/app/_store/slices/contestant-dashboard-slice";
import { Composition } from "@/config/composition";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/dashboard/MockContestantDashboardResponseDTO";
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

describe("ContestantDashboardProvider", () => {
  const session = MockSession();
  const contest = MockContestResponseDTO();
  const dashboard = MockContestantDashboardResponseDTO();

  beforeEach(() => {
    (
      Composition.dashboardReader.getContestantDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    expect(
      Composition.dashboardReader.getContestantDashboard,
    ).toHaveBeenCalledWith(contest.id);

    expect(Composition.broadcastClient.connect).toHaveBeenCalled();
    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    expect(room.name).toBe(`contests/${contest.id}/contestant`);

    const state = store.getState().contestantDashboard;
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
      Composition.dashboardReader.getContestantDashboard as jest.Mock
    ).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const state = store.getState().contestantDashboard;
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
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_UPDATED(leaderboardPartial);
    });
    expect(
      store.getState().contestantDashboard.leaderboard.rows[0].cells[0]
        .isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_FROZEN();
    });
    expect(store.getState().contestantDashboard.leaderboard.isFrozen).toBe(
      true,
    );
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const frozenSubmissions = [MockSubmissionResponseDTO()];
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.LEADERBOARD_UNFROZEN({
        leaderboard: otherLeaderboard,
        frozenSubmissions,
      });
    });
    expect(store.getState().contestantDashboard.leaderboard).toBe(
      otherLeaderboard,
    );
    expect(store.getState().contestantDashboard.submissions).toContain(
      frozenSubmissions[0],
    );
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionResponseDTO();
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.SUBMISSION_CREATED(otherSubmission);
    });
    expect(store.getState().contestantDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should handle member submission updates with accepted answer", async () => {
    const otherSubmission = MockSubmissionResponseDTO({
      answer: SubmissionAnswer.ACCEPTED,
    });
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.SUBMISSION_UPDATED(otherSubmission);
    });
    expect(store.getState().contestantDashboard.memberSubmissions).toContain(
      otherSubmission,
    );
    expect(useToast().success).toHaveBeenCalled();
    expect(store.getState().balloon).toHaveLength(1);
  });

  it("should handle member submission updates with wrong answer", async () => {
    const otherSubmission = MockSubmissionResponseDTO({
      answer: SubmissionAnswer.WRONG_ANSWER,
    });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.SUBMISSION_UPDATED(otherSubmission);
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle member submission updates with time limit exceeded", async () => {
    const otherSubmission = MockSubmissionResponseDTO({
      answer: SubmissionAnswer.TIME_LIMIT_EXCEEDED,
    });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.SUBMISSION_UPDATED(otherSubmission);
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle member submission updates with runtime error", async () => {
    const otherSubmission = MockSubmissionResponseDTO({
      answer: SubmissionAnswer.RUNTIME_ERROR,
    });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.SUBMISSION_UPDATED(otherSubmission);
    });
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle announcements update", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO();
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.ANNOUNCEMENT_CREATED(otherAnnouncement);
    });
    expect(store.getState().contestantDashboard.announcements).toContain(
      otherAnnouncement,
    );
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: dashboard.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_CREATED(otherClarification);
    });
    expect(
      store.getState().contestantDashboard.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should handle clarification answers", async () => {
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.CLARIFICATION_ANSWERED(
        MockClarificationResponseDTO({
          parentId: dashboard.clarifications[0].id,
        }),
      );
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.CLARIFICATION_DELETED({
        id: dashboard.clarifications[0].id,
      });
    });
    expect(store.getState().contestantDashboard.clarifications).toHaveLength(0);
  });

  it("should handle member ticket updates", async () => {
    const otherTicket = MockTicketResponseDTO();
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[1][0];
    act(() => {
      room.callbacks.TICKET_UPDATED(otherTicket);
    });
    expect(store.getState().contestantDashboard.memberTickets).toContain(
      otherTicket,
    );
  });

  it("should show toast on announcement created", async () => {
    const otherTicket = MockTicketResponseDTO({ version: 2 });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    const room = (Composition.broadcastClient.subscribe as jest.Mock).mock
      .calls[0][0];
    act(() => {
      room.callbacks.ANNOUNCEMENT_CREATED(otherTicket);
    });
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should show freeze banner if leaderboard is frozen", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    act(() => {
      store.dispatch(
        contestantDashboardSlice.actions.setLeaderboardIsFrozen(true),
      );
    });

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });

  it("should show disconnection banner if listener status is LOST_CONNECTION", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contest },
    );

    act(() => {
      store.dispatch(
        contestantDashboardSlice.actions.setListenerStatus(
          ListenerStatus.LOST_CONNECTION,
        ),
      );
    });

    expect(screen.getByTestId("disconnection-banner")).toBeInTheDocument();
  });
});
