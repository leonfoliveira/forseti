import { screen } from "@testing-library/react";

import { AdminDashboardProvider } from "@/app/_lib/provider/dashboard/AdminDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockAdminDashboardResponseDTO,
  MockContestResponseDTO,
  MockSessionResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockSubmissionResponseDTO,
  MockAnnouncementResponseDTO,
  MockMemberResponseDTO,
  MockClarificationResponseDTO,
  MockLeaderboardResponseDTO,
  MockPrintRequestResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { AdminDashboardResponseDTO } from "@/port/dto/response/dashboard/AdminDashboardResponseDTO";
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

describe("AdminDashboardProvider", () => {
  let dashboardData: AdminDashboardResponseDTO;
  let contest: ContestResponseDTO;
  let session: SessionResponseDTO;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardData = MockAdminDashboardResponseDTO();
    contest = MockContestResponseDTO();
    session = MockSessionResponseDTO();
    (
      Composition.dashboardReader.getAdminDashboard as jest.Mock
    ).mockResolvedValue(dashboardData);
  });

  async function renderDashboardProvider(
    overrideContest: ContestResponseDTO | null = null,
  ) {
    return renderWithProviders(
      <AdminDashboardProvider>
        <span data-testid="child">Ready</span>
      </AdminDashboardProvider>,
      {
        contest: overrideContest ?? contest,
        session,
      },
    );
  }

  function getListener(event: string) {
    const handlers = (
      Composition.adminDashboardRoomListener.subscribe as jest.Mock
    ).mock.calls[0][1];
    return handlers[event];
  }

  it("fetches dashboard data on startup", async () => {
    const { store } = await renderDashboardProvider();

    expect(Composition.dashboardReader.getAdminDashboard).toHaveBeenCalledWith(
      contest.id,
    );
    expect(store.getState().adminDashboard).toEqual(dashboardData);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders error page on failure", async () => {
    (
      Composition.dashboardReader.getAdminDashboard as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to fetch"));

    await renderDashboardProvider();

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
  });

  it("connects to broadcast listeners on startup", async () => {
    const { unmount } = await renderDashboardProvider();

    expect(
      Composition.adminDashboardRoomListener.subscribe,
    ).toHaveBeenCalledWith(
      contest.id,
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
    );
    unmount();
    expect(
      Composition.adminDashboardRoomListener.unsubscribe,
    ).toHaveBeenCalled();
  });

  it("shows disconnection banner when broadcast listeners connection failure", async () => {
    (
      Composition.adminDashboardRoomListener.subscribe as jest.Mock
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

  describe("receiveLeaderboardCell", () => {
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
        store.getState().adminDashboard.leaderboard.rows[0].cells[0].isAccepted,
      ).toBe(true);
    });
  });

  describe("receiveSubmissionUpdate", () => {
    it("receives submission update", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().adminDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });

    it("shows toast when receive submission update with FAILED status", async () => {
      await renderDashboardProvider();

      const handler = getListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionResponseDTO({
        status: SubmissionStatus.FAILED,
      });

      handler(submission);

      expect(useToast().error).toHaveBeenCalled();
    });
  });

  describe("receiveAnnouncementCreated", () => {
    it("receives announcement created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("ANNOUNCEMENT_CREATED");
      const announcement = MockAnnouncementResponseDTO({
        member: MockMemberResponseDTO({ id: session.member.id }),
      });

      handler(announcement);

      expect(store.getState().adminDashboard.announcements).toContainEqual(
        expect.objectContaining(announcement),
      );
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

      expect(store.getState().adminDashboard.clarifications).toContainEqual(
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

      expect(store.getState().adminDashboard.clarifications).toContainEqual(
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

      expect(store.getState().adminDashboard.clarifications).toContainEqual(
        expect.objectContaining(clarification),
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUpdated", () => {
    it("receives contest updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_UPDATED");
      const contest = MockContestResponseDTO();

      handler(contest);

      expect(store.getState().adminDashboard.contest).toEqual(contest);
    });
  });

  describe("receiveContestFrozen", () => {
    it("receives contest frozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_FROZEN");
      const contest = MockContestResponseDTO();

      handler(contest);

      expect(store.getState().contest).toEqual(contest);
      expect(store.getState().adminDashboard.contest).toEqual(contest);
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUnfrozen", () => {
    it("receives contest unfrozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_UNFROZEN");
      const contest = MockContestResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionResponseDTO()];

      handler({ contest, leaderboard, submissions });

      expect(store.getState().contest).toEqual(contest);
      expect(store.getState().adminDashboard.contest).toEqual(contest);
      expect(store.getState().adminDashboard.leaderboard).toEqual(leaderboard);
      expect(store.getState().adminDashboard.submissions).toContainEqual(
        submissions[0],
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receivePrintRequest", () => {
    it("receives print request", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("PRINT_REQUEST_CREATED");
      const printRequest = MockPrintRequestResponseDTO();

      handler(printRequest);

      expect(store.getState().adminDashboard.printRequests).toContainEqual(
        expect.objectContaining(printRequest),
      );
    });
  });
});
