import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";
import { v4 as uuidv4 } from "uuid";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { JudgeDashboardProvider } from "@/app/_lib/provider/judge-dashboard-provider";
import { judgeDashboardSlice } from "@/app/_store/slices/judge-dashboard-slice";
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
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardPartialResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardPartialResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionFullWithExecutionResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullWithExecutionResponseDTO";
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
  const contestMetadata = MockContestMetadataResponseDTO();
  const contest = MockContestPublicResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();
  const submissions = [
    MockSubmissionFullWithExecutionResponseDTO(),
    MockSubmissionFullWithExecutionResponseDTO(),
  ];
  const memberTickets = [MockTicketResponseDTO()];
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (dashboardReader.getJudge as jest.Mock).mockResolvedValue({
      contest,
      leaderboard,
      submissions,
      memberTickets,
    });
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    expect(dashboardReader.getJudge).toHaveBeenCalledWith(contestMetadata.id);

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
    expect(ticketListener.subscribeForMember).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      session.member.id,
      expect.any(Function),
    );

    const state = store.getState().judgeDashboard;
    expect(state).toEqual({
      contest,
      leaderboard,
      submissions,
      memberTickets,
      listenerStatus: ListenerStatus.CONNECTED,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (dashboardReader.getJudge as jest.Mock).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    const state = store.getState().judgeDashboard;
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
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboardPartial as jest.Mock
      ).mock.calls[0][2](leaderboardPartial);
    });
    expect(
      store.getState().judgeDashboard.leaderboard.members[0].problems[0]
        .isAccepted,
    ).toBe(leaderboardPartial.isAccepted);
  });

  it("should handle leaderboard freeze updates", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
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
    expect(store.getState().judgeDashboard.leaderboard.isFrozen).toBe(true);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle leaderboard unfreeze updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
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
    expect(store.getState().judgeDashboard.leaderboard).toBe(otherLeaderboard);
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionFullWithExecutionResponseDTO();
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        submissionListener.subscribeForContestFull as jest.Mock
      ).mock.calls[0][2](otherSubmission);
    });
    expect(store.getState().judgeDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should show a toast for failed submissions", async () => {
    const otherSubmission = MockSubmissionFullWithExecutionResponseDTO({
      status: SubmissionStatus.FAILED,
    });
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
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
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(store.getState().judgeDashboard.contest.announcements).toContain(
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
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(
      store.getState().judgeDashboard.contest.clarifications[0].children,
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
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: contest.clarifications[0].id });
    });
    expect(store.getState().judgeDashboard.contest.clarifications).toHaveLength(
      0,
    );
  });

  it("should handle member ticket updates", async () => {
    const otherTicket = MockTicketResponseDTO();
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (ticketListener.subscribeForMember as jest.Mock).mock.calls[0][3](
        otherTicket,
      );
    });
    expect(store.getState().judgeDashboard.memberTickets).toContain(
      otherTicket,
    );
  });

  it("should show toast on announcement update", async () => {
    const otherTicket = MockTicketResponseDTO({ version: 2 });
    await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (ticketListener.subscribeForMember as jest.Mock).mock.calls[0][3](
        otherTicket,
      );
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should show freeze banner if leaderboard is frozen", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      store.dispatch(judgeDashboardSlice.actions.setLeaderboardIsFrozen(true));
    });

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });

  it("should show disconnection banner if listener status is LOST_CONNECTION", async () => {
    const { store } = await renderWithProviders(
      <JudgeDashboardProvider>
        <div data-testid="child" />
      </JudgeDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      store.dispatch(
        judgeDashboardSlice.actions.setListenerStatus(
          ListenerStatus.LOST_CONNECTION,
        ),
      );
    });

    expect(screen.getByTestId("disconnection-banner")).toBeInTheDocument();
  });
});
