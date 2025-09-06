import { randomUUID } from "crypto";

import { screen } from "@testing-library/dom";
import { mock } from "jest-mock-extended";
import { act } from "react";

import {
  announcementListener,
  clarificationListener,
  contestService,
  leaderboardListener,
  leaderboardService,
  listenerClientFactory,
  submissionListener,
  submissionService,
} from "@/config/composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { AdminDashboardProvider } from "@/lib/provider/admin-dashboard-provider";
import { useToast } from "@/lib/util/toast-hook";
import { MockAuthorization } from "@/test/mock/model/MockAuthorization";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/lib/component/page/loading-page", () => ({
  LoadingPage: () => <span data-testid="loading-page" />,
}));
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <span data-testid="error-page" />,
}));

describe("AdminDashboardProvider", () => {
  const authorization = MockAuthorization();
  const contestMetadata = MockContestMetadataResponseDTO();
  const contest = MockContestFullResponseDTO();
  const leaderboard = MockLeaderboardResponseDTO();
  const submissions = [
    MockSubmissionFullResponseDTO(),
    MockSubmissionFullResponseDTO(),
  ];
  const listenerClient = mock<ListenerClient>();

  beforeEach(() => {
    (contestService.findFullContestById as jest.Mock).mockResolvedValue(
      contest,
    );
    (leaderboardService.findContestLeaderboard as jest.Mock).mockResolvedValue(
      leaderboard,
    );
    (
      submissionService.findAllContestFullSubmissions as jest.Mock
    ).mockResolvedValue(submissions);
    (listenerClientFactory.create as jest.Mock).mockReturnValue(listenerClient);
  });

  it("should load data on startup and render children", async () => {
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    expect(contestService.findFullContestById).toHaveBeenCalledWith(
      contestMetadata.id,
    );
    expect(leaderboardService.findContestLeaderboard).toHaveBeenCalledWith(
      contestMetadata.id,
    );
    expect(
      submissionService.findAllContestFullSubmissions,
    ).toHaveBeenCalledWith(contestMetadata.id);

    expect(leaderboardListener.subscribeForLeaderboard).toHaveBeenCalledWith(
      listenerClient,
      contestMetadata.id,
      expect.any(Function),
    );
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

    const state = store.getState().adminDashboard;
    expect(state).toEqual({
      contest,
      leaderboard,
      submissions,
    });

    expect(screen.queryByTestId("error-page")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    const error = new Error("Test error");
    (contestService.findFullContestById as jest.Mock).mockRejectedValue(error);
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    const state = store.getState().adminDashboard;
    expect(state).toBeNull();

    expect(screen.queryByTestId("error-page")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("should handle leaderboard updates", async () => {
    const otherLeaderboard = MockLeaderboardResponseDTO();
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    act(() => {
      (
        leaderboardListener.subscribeForLeaderboard as jest.Mock
      ).mock.calls[0][2](otherLeaderboard);
    });
    expect(store.getState().adminDashboard.leaderboard).toBe(otherLeaderboard);
  });

  it("should handle submissions updates", async () => {
    const otherSubmission = MockSubmissionFullResponseDTO();
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    act(() => {
      (
        submissionListener.subscribeForContestFull as jest.Mock
      ).mock.calls[0][2](otherSubmission);
    });
    expect(store.getState().adminDashboard.submissions).toContain(
      otherSubmission,
    );
  });

  it("should show a toast for failed submissions", async () => {
    const otherSubmission = MockSubmissionFullResponseDTO({
      status: SubmissionStatus.FAILED,
    });
    await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
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
      member: authorization.member,
    });
    const { store } = await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    act(() => {
      (announcementListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherAnnouncement,
      );
    });
    expect(store.getState().adminDashboard.contest.announcements).toContain(
      otherAnnouncement,
    );
  });

  it("should show a toast for announcements not owned by member", async () => {
    const otherAnnouncement = MockAnnouncementResponseDTO({
      member: { ...MockAnnouncementResponseDTO().member, id: randomUUID() },
    });
    await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
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
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    act(() => {
      (clarificationListener.subscribeForContest as jest.Mock).mock.calls[0][2](
        otherClarification,
      );
    });
    expect(
      store.getState().adminDashboard.contest.clarifications[0].children,
    ).toContain(otherClarification);
  });

  it("should show toast for clarifications without parent", async () => {
    const otherClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });
    await renderWithProviders(
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
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
      <AdminDashboardProvider>
        <div data-testid="child" />
      </AdminDashboardProvider>,
      { authorization, contestMetadata },
    );

    act(() => {
      (
        clarificationListener.subscribeForContestDeleted as jest.Mock
      ).mock.calls[0][2]({ id: contest.clarifications[0].id });
    });
    expect(store.getState().adminDashboard.contest.clarifications).toHaveLength(
      0,
    );
  });
});
