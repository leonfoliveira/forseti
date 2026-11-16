import { screen } from "@testing-library/react";

import { SpectatorDashboardProvider } from "@/app/_lib/provider/dashboard/SpectatorDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockSpectatorDashboardResponseDTO,
  MockContestResponseDTO,
  MockSessionResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockSubmissionResponseDTO,
  MockAnnouncementResponseDTO,
  MockMemberResponseDTO,
  MockClarificationResponseDTO,
  MockLeaderboardResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { SpectatorDashboardResponseDTO } from "@/port/dto/response/dashboard/SpectatorDashboardResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { useToast } from "@/app/_lib/hook/useToast";

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

describe("SpectatorDashboardProvider", () => {
  let dashboardData: SpectatorDashboardResponseDTO;
  let contest: ContestResponseDTO;
  let session: SessionResponseDTO;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardData = MockSpectatorDashboardResponseDTO();
    contest = MockContestResponseDTO();
    session = MockSessionResponseDTO();
    (
      Composition.dashboardReader.getSpectatorDashboard as jest.Mock
    ).mockResolvedValue(dashboardData);
  });

  async function renderDashboardProvider(
    overrideContest: ContestResponseDTO | null = null,
  ) {
    return renderWithProviders(
      <SpectatorDashboardProvider>
        <span data-testid="child">Ready</span>
      </SpectatorDashboardProvider>,
      {
        contest: overrideContest ?? contest,
        session,
      },
    );
  }

  function getListener(event: string) {
    const handlers = (
      Composition.spectatorDashboardRoomListener.subscribe as jest.Mock
    ).mock.calls[0][1];
    return handlers[event];
  }

  it("fetches dashboard data on startup", async () => {
    const { store } = await renderDashboardProvider();

    expect(
      Composition.dashboardReader.getSpectatorDashboard,
    ).toHaveBeenCalledWith(contest.id);
    expect(store.getState().spectatorDashboard).toEqual(dashboardData);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders error page on failure", async () => {
    (
      Composition.dashboardReader.getSpectatorDashboard as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to fetch"));

    await renderDashboardProvider();

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
  });

  it("connects to broadcast listeners on startup", async () => {
    const { unmount } = await renderDashboardProvider();

    expect(
      Composition.spectatorDashboardRoomListener.subscribe,
    ).toHaveBeenCalledWith(
      contest.id,
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
    );
    unmount();
    expect(
      Composition.spectatorDashboardRoomListener.unsubscribe,
    ).toHaveBeenCalled();
  });

  it("shows disconnection banner when broadcast listeners connection failure", async () => {
    (
      Composition.spectatorDashboardRoomListener.subscribe as jest.Mock
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
        store.getState().spectatorDashboard.leaderboard.rows[0].cells[0]
          .isAccepted,
      ).toBe(true);
    });
  });

  describe("receiveSubmission", () => {
    it("receives submission created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_CREATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().spectatorDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });

    it("receives submission updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().spectatorDashboard.submissions).toContainEqual(
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

      expect(store.getState().spectatorDashboard.announcements).toContainEqual(
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

  describe("receiveClarificationPublished", () => {
    it("receives clarification published", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CLARIFICATION_PUBLISHED");
      const clarification = MockClarificationResponseDTO();

      handler(clarification);

      expect(store.getState().spectatorDashboard.clarifications).toContainEqual(
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
      expect(store.getState().spectatorDashboard.contest).toEqual(
        updatedContest,
      );
    });
  });

  describe("receiveContestFrozen", () => {
    it("receives contest frozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_FROZEN");
      const frozenContest = MockContestResponseDTO();

      handler(frozenContest);

      expect(store.getState().spectatorDashboard.contest).toEqual(
        frozenContest,
      );
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

      expect(store.getState().spectatorDashboard.contest).toEqual(
        unfrozenContest,
      );
      expect(store.getState().spectatorDashboard.leaderboard).toEqual(
        leaderboard,
      );
      expect(store.getState().spectatorDashboard.submissions).toContainEqual(
        submissions[0],
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });
});
