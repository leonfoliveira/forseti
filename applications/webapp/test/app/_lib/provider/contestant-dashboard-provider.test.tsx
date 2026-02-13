import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";

import { useToast } from "@/app/_lib/hook/toast-hook";
import { ContestantDashboardProvider } from "@/app/_lib/provider/contestant-dashboard-provider";
import {
  announcementListener,
  clarificationListener,
  dashboardReader,
  leaderboardListener,
  listenerClientFactory,
  submissionListener,
} from "@/config/composition";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSession } from "@/test/mock/response/session/MockSession";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/app/_lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

describe("ContestantDashboardProvider", () => {
  const session = MockSession();
  const contestMetadata = MockContestMetadataResponseDTO();
  const contest = MockContestPublicResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();
  const submissions = [
    MockSubmissionPublicResponseDTO(),
    MockSubmissionPublicResponseDTO(),
  ];
  const memberSubmissions = [
    MockSubmissionFullResponseDTO(),
    MockSubmissionFullResponseDTO(),
  ];
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (dashboardReader.getContestant as jest.Mock).mockResolvedValue({
      contest,
      leaderboard,
      submissions,
      memberSubmissions,
    });
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    expect(dashboardReader.getContestant).toHaveBeenCalledWith(
      contestMetadata.id,
    );

    expect(leaderboardListener.subscribeForLeaderboard).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(submissionListener.subscribeForContest).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
    expect(submissionListener.subscribeForMemberFull).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      session.member.id,
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
      clarificationListener.subscribeForMemberChildren,
    ).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      session.member.id,
      expect.any(Function),
    );
    expect(
      clarificationListener.subscribeForContestDeleted,
    ).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );

    const state = store.getState().contestantDashboard;
    expect(state).toEqual({
      contest,
      leaderboard,
      submissions,
      memberSubmissions,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (dashboardReader.getContestant as jest.Mock).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    const state = store.getState().contestantDashboard;
    expect(state).toBeNull();

    expect(screen.queryByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should handle leaderboard updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboard as jest.Mock
      ).mock.calls[0][2](otherLeaderboard);
    });
    expect(store.getState().contestantDashboard.leaderboard).toBe(
      otherLeaderboard,
    );
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO();
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherSubmission,
      );
    });
    expect(store.getState().contestantDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should handle member submission updates with accepted answer", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO({
      answer: SubmissionAnswer.ACCEPTED,
    });
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForMemberFull as jest.Mock).mock.calls[0][3](
        otherSubmission,
      );
    });
    expect(store.getState().contestantDashboard.memberSubmissions).toContain(
      otherSubmission,
    );
    expect(useToast().success).toHaveBeenCalled();
  });

  it("should handle member submission updates with wrong answer", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO({
      answer: SubmissionAnswer.WRONG_ANSWER,
    });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForMemberFull as jest.Mock).mock.calls[0][3](
        otherSubmission,
      );
    });
    expect(useToast().error).toHaveBeenCalled();
  });

  it("should handle member submission updates with time limit exceeded", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO({
      answer: SubmissionAnswer.TIME_LIMIT_EXCEEDED,
    });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForMemberFull as jest.Mock).mock.calls[0][3](
        otherSubmission,
      );
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle member submission updates with runtime error", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO({
      answer: SubmissionAnswer.RUNTIME_ERROR,
    });
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForMemberFull as jest.Mock).mock.calls[0][3](
        otherSubmission,
      );
    });
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should ignore member submission updates with no answer", async () => {
    const otherSubmission = MockSubmissionPublicResponseDTO({
      answer: SubmissionAnswer.NO_ANSWER,
    });
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (submissionListener.subscribeForMemberFull as jest.Mock).mock.calls[0][3](
        otherSubmission,
      );
    });
    expect(
      store.getState().contestantDashboard.memberSubmissions,
    ).not.toContain(otherSubmission);
  });

  it("should handle announcements update", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO();
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(
      store.getState().contestantDashboard.contest.announcements,
    ).toContain(otherAnnouncement);
    expect(useToast().warning).toHaveBeenCalled();
  });

  it("should handle clarifications updates", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: contest.clarifications[0].id,
    });
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(
      store.getState().contestantDashboard.contest.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should handle clarification answers", async () => {
    await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForMemberChildren as jest.Mock
      ).mock.calls[0][3]();
    });
    expect(useToast().info).toHaveBeenCalled();
  });

  it("should handle deleted clarifications", async () => {
    const { store } = await renderWithProviders(
      <ContestantDashboardProvider>
        <div data-testid="child" />
      </ContestantDashboardProvider>,
      { session, contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: contest.clarifications[0].id });
    });
    expect(
      store.getState().contestantDashboard.contest.clarifications,
    ).toHaveLength(0);
  });
});
