import { screen } from "@testing-library/react";

import { ContestantDashboardProvider } from "@/app/_lib/provider/dashboard/ContestantDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockContestantDashboardResponseDTO,
  MockContestResponseDTO,
  MockSessionResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockSubmissionResponseDTO,
  MockSubmissionWithCodeResponseDTO,
  MockAnnouncementResponseDTO,
  MockMemberResponseDTO,
  MockClarificationResponseDTO,
  MockLeaderboardResponseDTO,
  MockPrintRequestResponseDTO,
  MockProblemResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { SessionResponseDTO } from "@/port/dto/response/session/SessionResponseDTO";
import { ContestantDashboardResponseDTO } from "@/port/dto/response/dashboard/ContestantDashboardResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
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

describe("ContestantDashboardProvider", () => {
  let dashboardData: ContestantDashboardResponseDTO;
  let contest: ContestResponseDTO;
  let session: SessionResponseDTO;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardData = MockContestantDashboardResponseDTO();
    contest = MockContestResponseDTO();
    session = MockSessionResponseDTO();
    (
      Composition.dashboardReader.getContestantDashboard as jest.Mock
    ).mockResolvedValue(dashboardData);
  });

  async function renderDashboardProvider(
    overrideContest: ContestResponseDTO | null = null,
  ) {
    return renderWithProviders(
      <ContestantDashboardProvider>
        <span data-testid="child">Ready</span>
      </ContestantDashboardProvider>,
      {
        contest: overrideContest ?? contest,
        session,
      },
    );
  }

  function getDashboardListener(event: string) {
    const handlers = (
      Composition.contestantDashboardRoomListener.subscribe as jest.Mock
    ).mock.calls[0][1];
    return handlers[event];
  }

  function getMemberListener(event: string) {
    const handlers = (
      Composition.memberPrivateRoomListener.subscribe as jest.Mock
    ).mock.calls[0][1];
    return handlers[event];
  }

  it("fetches dashboard data on startup", async () => {
    const { store } = await renderDashboardProvider();

    expect(
      Composition.dashboardReader.getContestantDashboard,
    ).toHaveBeenCalledWith(contest.id);
    expect(store.getState().contestantDashboard).toEqual(dashboardData);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders error page on failure", async () => {
    (
      Composition.dashboardReader.getContestantDashboard as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to fetch"));

    await renderDashboardProvider();

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
  });

  it("connects to broadcast listeners on startup", async () => {
    const { unmount } = await renderDashboardProvider();

    expect(
      Composition.contestantDashboardRoomListener.subscribe,
    ).toHaveBeenCalledWith(
      contest.id,
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
    );
    expect(
      Composition.memberPrivateRoomListener.subscribe,
    ).toHaveBeenCalledWith(
      session.member.id,
      expect.any(Object),
      expect.any(Function),
      expect.any(Function),
    );

    unmount();

    expect(
      Composition.contestantDashboardRoomListener.unsubscribe,
    ).toHaveBeenCalled();
    expect(
      Composition.memberPrivateRoomListener.unsubscribe,
    ).toHaveBeenCalled();
  });

  it("shows disconnection banner when contestant dashboard broadcast listeners connection fails", async () => {
    (
      Composition.contestantDashboardRoomListener.subscribe as jest.Mock
    ).mockRejectedValueOnce(new Error("Failed to connect"));

    await renderDashboardProvider();

    expect(screen.getByTestId("disconnection-banner")).toBeInTheDocument();
  });

  it("shows disconnection banner when member private broadcast listeners connection fails", async () => {
    (
      Composition.memberPrivateRoomListener.subscribe as jest.Mock
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

      const handler = getDashboardListener("LEADERBOARD_UPDATED");
      const leaderboardCell = MockLeaderboardCellResponseDTO({
        memberId: targetRow.memberId,
        problemId: targetCell.problemId,
        isAccepted: true,
        acceptedAt: new Date().toISOString(),
      });

      handler(leaderboardCell);

      expect(
        store.getState().contestantDashboard.leaderboard.rows[0].cells[0]
          .isAccepted,
      ).toBe(true);
    });
  });

  describe("receiveSubmission", () => {
    it("receives submission created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("SUBMISSION_CREATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().contestantDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });

    it("receives submission updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionResponseDTO();

      handler(submission);

      expect(store.getState().contestantDashboard.submissions).toContainEqual(
        expect.objectContaining(submission),
      );
    });
  });

  describe("receiveMemberSubmission", () => {
    it("ignores submission without answer", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("SUBMISSION_UPDATED");
      const submission = MockSubmissionWithCodeResponseDTO({
        answer: undefined,
      });

      handler(submission);

      expect(
        store.getState().contestantDashboard.memberSubmissions,
      ).not.toContainEqual(expect.objectContaining(submission));
      expect(useToast().success).not.toHaveBeenCalled();
      expect(useToast().error).not.toHaveBeenCalled();
      expect(useToast().info).not.toHaveBeenCalled();
      expect(useToast().warning).not.toHaveBeenCalled();
    });

    it("merges member submission, shows success toast, and adds balloon when ACCEPTED", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("SUBMISSION_UPDATED");
      const problem = MockProblemResponseDTO({ letter: "A", color: "#ff0000" });
      const submission = MockSubmissionWithCodeResponseDTO({
        problem,
        answer: SubmissionAnswer.ACCEPTED,
      });

      handler(submission);

      expect(
        store.getState().contestantDashboard.memberSubmissions,
      ).toContainEqual(expect.objectContaining(submission));
      expect(useToast().success).toHaveBeenCalled();
      expect(store.getState().balloon).toContainEqual({
        id: expect.any(String),
        color: problem.color,
      });
    });

    it("shows error toast when WRONG_ANSWER", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("SUBMISSION_UPDATED");
      const problem = MockProblemResponseDTO({ letter: "B" });
      const submission = MockSubmissionWithCodeResponseDTO({
        problem,
        answer: SubmissionAnswer.WRONG_ANSWER,
      });

      handler(submission);

      expect(
        store.getState().contestantDashboard.memberSubmissions,
      ).toContainEqual(expect.objectContaining(submission));
      expect(useToast().error).toHaveBeenCalled();
    });

    it.each([
      SubmissionAnswer.TIME_LIMIT_EXCEEDED,
      SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
    ])("shows info toast when %s", async (answer) => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("SUBMISSION_UPDATED");
      const problem = MockProblemResponseDTO({ letter: "C" });
      const submission = MockSubmissionWithCodeResponseDTO({
        problem,
        answer,
      });

      handler(submission);

      expect(
        store.getState().contestantDashboard.memberSubmissions,
      ).toContainEqual(expect.objectContaining(submission));
      expect(useToast().info).toHaveBeenCalled();
    });

    it.each([
      SubmissionAnswer.RUNTIME_ERROR,
      SubmissionAnswer.COMPILATION_ERROR,
    ])("shows warning toast when %s", async (answer) => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("SUBMISSION_UPDATED");
      const problem = MockProblemResponseDTO({ letter: "D" });
      const submission = MockSubmissionWithCodeResponseDTO({
        problem,
        answer,
      });

      handler(submission);

      expect(
        store.getState().contestantDashboard.memberSubmissions,
      ).toContainEqual(expect.objectContaining(submission));
      expect(useToast().warning).toHaveBeenCalled();
    });
  });

  describe("receiveAnnouncement", () => {
    it("receives announcement created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("ANNOUNCEMENT_CREATED");
      const announcement = MockAnnouncementResponseDTO({
        member: MockMemberResponseDTO({ id: session.member.id }),
      });

      handler(announcement);

      expect(store.getState().contestantDashboard.announcements).toContainEqual(
        expect.objectContaining(announcement),
      );
      expect(useToast().warning).not.toHaveBeenCalled();
    });

    it("shows toast when announcement is created for other member", async () => {
      await renderDashboardProvider();

      const handler = getDashboardListener("ANNOUNCEMENT_CREATED");
      const announcement = MockAnnouncementResponseDTO({});

      handler(announcement);

      expect(useToast().warning).toHaveBeenCalled();
    });
  });

  describe("receiveClarificationAnswered", () => {
    it("receives clarification answered", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("CLARIFICATION_ANSWERED");
      const clarification = MockClarificationResponseDTO();

      handler(clarification);

      expect(
        store.getState().contestantDashboard.clarifications,
      ).toContainEqual(expect.objectContaining(clarification));
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveClarificationPublished", () => {
    it("receives clarification published", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("CLARIFICATION_PUBLISHED");
      const clarification = MockClarificationResponseDTO();

      handler(clarification);

      expect(
        store.getState().contestantDashboard.clarifications,
      ).toContainEqual(expect.objectContaining(clarification));
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUpdated", () => {
    it("receives contest updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("CONTEST_UPDATED");
      const updatedContest = MockContestResponseDTO();

      handler(updatedContest);

      expect(store.getState().contest).toEqual(updatedContest);
      expect(store.getState().contestantDashboard.contest).toEqual(
        updatedContest,
      );
    });
  });

  describe("receiveContestFrozen", () => {
    it("receives contest frozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("CONTEST_FROZEN");
      const frozenContest = MockContestResponseDTO();

      handler(frozenContest);

      expect(store.getState().contestantDashboard.contest).toEqual(
        frozenContest,
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receiveContestUnfrozen", () => {
    it("receives contest unfrozen", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getDashboardListener("CONTEST_UNFROZEN");
      const unfrozenContest = MockContestResponseDTO();
      const leaderboard = MockLeaderboardResponseDTO();
      const submissions = [MockSubmissionResponseDTO()];

      handler({ contest: unfrozenContest, leaderboard, submissions });

      expect(store.getState().contestantDashboard.contest).toEqual(
        unfrozenContest,
      );
      expect(store.getState().contestantDashboard.leaderboard).toEqual(
        leaderboard,
      );
      expect(store.getState().contestantDashboard.submissions).toContainEqual(
        submissions[0],
      );
      expect(useToast().info).toHaveBeenCalled();
    });
  });

  describe("receivePrintRequest", () => {
    it("receives print request created", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("PRINT_REQUEST_CREATED");
      const printRequest = MockPrintRequestResponseDTO();

      handler(printRequest);

      expect(store.getState().contestantDashboard.printRequests).toContainEqual(
        expect.objectContaining(printRequest),
      );
    });

    it("receives print request updated", async () => {
      const { store } = await renderDashboardProvider();

      const handler = getMemberListener("PRINT_REQUEST_UPDATED");
      const printRequest = MockPrintRequestResponseDTO();

      handler(printRequest);

      expect(store.getState().contestantDashboard.printRequests).toContainEqual(
        expect.objectContaining(printRequest),
      );
    });
  });
});
