import { screen } from "@testing-library/react";

import { useToast } from "@/app/_lib/hook/useToast";
import { JudgeDashboardProvider } from "@/app/_lib/provider/dashboard/JudgeDashboardProvider";
import { Composition } from "@/config/composition";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { JudgeDashboardResponseDTO } from "@/port/dto/response/dashboard/JudgeDashboardResponseDTO";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import {
  MockAnnouncementResponseDTO,
  MockClarificationResponseDTO,
  MockContestResponseDTO,
  MockJudgeDashboardResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockLeaderboardResponseDTO,
  MockMemberResponseDTO,
  MockSessionResponseDTO,
  MockSubmissionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/LoadingPage", () => ({
  LoadingPage: () => <div data-testid="loading-page">Loading</div>,
}));
jest.mock("@/app/_lib/component/page/ErrorPage", () => ({
  ErrorPage: () => <div data-testid="error-page">Error</div>,
}));
jest.mock("@/app/_lib/component/feedback/DisconnectionBanner", () => ({
  DisconnectionBanner: () => (
    <div data-testid="disconnection-banner">Disconnected</div>
  ),
}));
jest.mock("@/app/_lib/component/feedback/FreezeBanner", () => ({
  FreezeBanner: () => <div data-testid="freeze-banner">Frozen</div>,
}));

describe("JudgeDashboardProvider", () => {
  let dashboardData: JudgeDashboardResponseDTO;
  let contest: ContestResponseDTO;
  let session: SessionResponseDTO;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardData = MockJudgeDashboardResponseDTO();
    contest = MockContestResponseDTO();
    session = MockSessionResponseDTO();
    (
      Composition.dashboardReader.getJudgeDashboard as jest.Mock
    ).mockResolvedValue(dashboardData);
  });

  async function renderDashboardProvider(
    overrideContest: ContestResponseDTO | null = null,
  ) {
    return renderWithProviders(
      <JudgeDashboardProvider>
        <span data-testid="child">Ready</span>
      </JudgeDashboardProvider>,
      {
        contest: overrideContest ?? contest,
        session,
      },
    );
  }

  function getListener(event: string) {
    const handlers = (
      Composition.judgeDashboardRoomListener.subscribe as jest.Mock
    ).mock.calls[0][1];
    return handlers[event];
  }

  it("fetches dashboard data on startup", async () => {
    const { store } = await renderDashboardProvider();

    expect(Composition.dashboardReader.getJudgeDashboard).toHaveBeenCalledWith(
      contest.id,
    );
    expect(store.getState().judgeDashboard).toEqual(dashboardData);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders error page on failure", async () => {
    (
      Composition.dashboardReader.getJudgeDashboard as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to fetch"));

    await renderDashboardProvider();

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
  });

  it("connects to broadcast listeners on startup", async () => {
    const { unmount } = await renderDashboardProvider();

    expect(
      Composition.judgeDashboardRoomListener.subscribe,
    ).toHaveBeenCalledWith(
      contest.id,
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
    );
    unmount();
    expect(
      Composition.judgeDashboardRoomListener.unsubscribe,
    ).toHaveBeenCalled();
  });

  it("shows disconnection banner when broadcast listeners connection failure", async () => {
    (
      Composition.judgeDashboardRoomListener.subscribe as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to connect"));

    await renderDashboardProvider();

    expect(screen.getByTestId("disconnection-banner")).toBeInTheDocument();
  });

  it("renders freeze banner when contest is frozen", async () => {
    await renderDashboardProvider(
      MockContestResponseDTO({
        frozenAt: new Date().toISOString(),
      }),
    );

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });

  describe("receiveLeaderboardPartial", () => {
    it("receives leaderboard cell update", async () => {
      const { store } = await renderDashboardProvider();

      const targetRow = dashboardData.leaderboard.rows[0];
      const targetCell = targetRow.cells[0];

      const handler = getListener("LEADERBOARD_UPDATED");
      const leaderboardCell = MockLeaderboardCellResponseDTO({
        memberId: targetRow.memberId,
        problemId: targetCell.problemId,
        isAccepted: true,
        acceptedAt: new Date().toISOString(),
      });

      handler(leaderboardCell);

      expect(
        store.getState().judgeDashboard.leaderboard.rows[0].cells[0].isAccepted,
      ).toBe(true);
    });
  });

  describe("receiveSubmission", () => {
    it("receives submission created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_CREATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().judgeDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });

    it("receives submission updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().judgeDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });

    it("shows toast when receive submission with FAILED status", async () => {
      await renderDashboardProvider();

      const handler = getListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionResponseDTO({
        status: SubmissionStatus.FAILED,
      });

      handler(submission);

      expect(useToast().error).toHaveBeenCalled();
    });
  });

  describe("receiveAnnouncement", () => {
    it("receives announcement created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("ANNOUNCEMENT_CREATED");
      const announcement = MockAnnouncementResponseDTO({
        member: MockMemberResponseDTO({ id: session.member.id }),
      });

      handler(announcement);

      expect(store.getState().judgeDashboard.announcements).toContainEqual(
        expect.objectContaining(announcement),
      );
      expect(useToast().warning).not.toHaveBeenCalled();
    });

    it("shows toast when announcement is created for other member", async () => {
      await renderDashboardProvider();

      const handler = getListener("ANNOUNCEMENT_CREATED");
      const announcement = MockAnnouncementResponseDTO({});

      handler(announcement);

      expect(useToast().warning).toHaveBeenCalled();
    });
  });

  describe("receiveClarificationCreated", () => {
    it("receives clarification created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CLARIFICATION_CREATED");
      const clarification = MockClarificationResponseDTO();

      handler(clarification);

      expect(store.getState().judgeDashboard.clarifications).toContainEqual(
        expect.objectContaining(clarification),
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveClarificationAnswered", () => {
    it("receives clarification answered", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CLARIFICATION_ANSWERED");
      const clarification = MockClarificationResponseDTO();

      handler(clarification);

      expect(store.getState().judgeDashboard.clarifications).toContainEqual(
        expect.objectContaining(clarification),
      );
    });
  });

  describe("receiveClarificationPublished", () => {
    it("receives clarification published", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CLARIFICATION_PUBLISHED");
      const clarification = MockClarificationResponseDTO();

      handler(clarification);

      expect(store.getState().judgeDashboard.clarifications).toContainEqual(
        expect.objectContaining(clarification),
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUpdated", () => {
    it("receives contest updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_UPDATED");
      const updatedContest = MockContestResponseDTO();

      handler(updatedContest);

      expect(store.getState().contest).toEqual(updatedContest);
      expect(store.getState().judgeDashboard.contest).toEqual(updatedContest);
    });
  });

  describe("receiveContestFrozen", () => {
    it("receives contest frozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_FROZEN");
      const frozenContest = MockContestResponseDTO();

      handler(frozenContest);

      expect(store.getState().judgeDashboard.contest).toEqual(frozenContest);
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUnfrozen", () => {
    it("receives contest unfrozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_UNFROZEN");
      const unfrozenContest = MockContestResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionResponseDTO()];

      handler({ contest: unfrozenContest, leaderboard, submissions });

      expect(store.getState().judgeDashboard.contest).toEqual(unfrozenContest);
      expect(store.getState().judgeDashboard.leaderboard).toEqual(leaderboard);
      expect(store.getState().judgeDashboard.submissions).toContainEqual(
        submissions[0],
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });
});
