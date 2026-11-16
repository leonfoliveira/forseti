import { screen } from "@testing-library/react";

import { StaffDashboardProvider } from "@/app/_lib/provider/dashboard/StaffDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockStaffDashboardResponseDTO,
  MockContestResponseDTO,
  MockSessionResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockSubmissionWithCodeResponseDTO,
  MockAnnouncementResponseDTO,
  MockMemberResponseDTO,
  MockClarificationResponseDTO,
  MockLeaderboardResponseDTO,
  MockPrintRequestResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { StaffDashboardResponseDTO } from "@/port/dto/response/dashboard/StaffDashboardResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
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

describe("StaffDashboardProvider", () => {
  let dashboardData: StaffDashboardResponseDTO;
  let contest: ContestResponseDTO;
  let session: SessionResponseDTO;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardData = MockStaffDashboardResponseDTO();
    contest = MockContestResponseDTO();
    session = MockSessionResponseDTO();
    (
      Composition.dashboardReader.getStaffDashboard as jest.Mock
    ).mockResolvedValue(dashboardData);
  });

  async function renderDashboardProvider(
    overrideContest: ContestResponseDTO | null = null,
  ) {
    return renderWithProviders(
      <StaffDashboardProvider>
        <span data-testid="child">Ready</span>
      </StaffDashboardProvider>,
      {
        contest: overrideContest ?? contest,
        session,
      },
    );
  }

  function getListener(event: string) {
    const handlers = (
      Composition.staffDashboardRoomListener.subscribe as jest.Mock
    ).mock.calls[0][1];
    return handlers[event];
  }

  it("fetches dashboard data on startup", async () => {
    const { store } = await renderDashboardProvider();

    expect(Composition.dashboardReader.getStaffDashboard).toHaveBeenCalledWith(
      contest.id,
    );
    expect(store.getState().staffDashboard).toEqual(dashboardData);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders error page on failure", async () => {
    (
      Composition.dashboardReader.getStaffDashboard as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to fetch"));

    await renderDashboardProvider();

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
  });

  it("connects to broadcast listeners on startup", async () => {
    const { unmount } = await renderDashboardProvider();

    expect(
      Composition.staffDashboardRoomListener.subscribe,
    ).toHaveBeenCalledWith(
      contest.id,
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
    );
    unmount();
    expect(
      Composition.staffDashboardRoomListener.unsubscribe,
    ).toHaveBeenCalled();
  });

  it("shows disconnection banner when broadcast listeners connection failure", async () => {
    (
      Composition.staffDashboardRoomListener.subscribe as jest.Mock
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
        store.getState().staffDashboard.leaderboard.rows[0].cells[0].isAccepted,
      ).toBe(true);
    });
  });

  describe("receiveSubmission", () => {
    it("receives submission created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_CREATED");
      const submission = MockSubmissionWithCodeResponseDTO();

      handler(submission);

      expect(store.getState().staffDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });

    it("receives submission updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionWithCodeResponseDTO();

      handler(submission);

      expect(store.getState().staffDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
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

      expect(store.getState().staffDashboard.announcements).toContainEqual(
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

      expect(store.getState().staffDashboard.clarifications).toContainEqual(
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
      expect(store.getState().staffDashboard.contest).toEqual(updatedContest);
    });
  });

  describe("receiveContestFrozen", () => {
    it("receives contest frozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_FROZEN");
      const frozenContest = MockContestResponseDTO();

      handler(frozenContest);

      expect(store.getState().staffDashboard.contest).toEqual(frozenContest);
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUnfrozen", () => {
    it("receives contest unfrozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("CONTEST_UNFROZEN");
      const unfrozenContest = MockContestResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionWithCodeResponseDTO()];

      handler({ contest: unfrozenContest, leaderboard, submissions });

      expect(store.getState().staffDashboard.contest).toEqual(unfrozenContest);
      expect(store.getState().staffDashboard.leaderboard).toEqual(leaderboard);
      expect(store.getState().staffDashboard.submissions).toContainEqual(
        submissions[0],
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receivePrintRequest", () => {
    it("receives print request created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("PRINT_REQUEST_CREATED");
      const printRequest = MockPrintRequestResponseDTO();

      handler(printRequest);

      expect(store.getState().staffDashboard.printRequests).toContainEqual(
        expect.objectContaining(printRequest),
      );
    });

    it("receives print request updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getListener("PRINT_REQUEST_UPDATED");
      const printRequest = MockPrintRequestResponseDTO();

      handler(printRequest);

      expect(store.getState().staffDashboard.printRequests).toContainEqual(
        expect.objectContaining(printRequest),
      );
    });
  });
});
