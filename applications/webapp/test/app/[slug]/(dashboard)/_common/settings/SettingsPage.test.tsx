import React from "react";
import { fireEvent, screen, act } from "@testing-library/react";

import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPage";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import {
  MockAdminDashboardResponseDTO,
  MockContestResponseDTO,
  MockContestWithMembersAndProblemsDTO,
  MockLeaderboardResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { Composition } from "@/config/composition";
import { SettingsForm } from "@/app/[slug]/(dashboard)/_common/settings/SettingsForm";
import { useToast } from "@/app/_lib/hook/useToast";
import { useNavigate } from "react-router-dom";
import { routes } from "@/config/routes";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/settings/SettingsPageContestTab",
  () => ({
    SettingsPageContestTab: () => (
      <div data-testid="contest-settings">Contest fields</div>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/settings/SettingsPageProblemsTab",
  () => ({
    SettingsPageProblemsTab: () => (
      <div data-testid="problem-settings">Problem fields</div>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/_common/settings/SettingsPageMembersTab",
  () => ({
    SettingsPageMembersTab: () => (
      <div data-testid="member-settings">Member fields</div>
    ),
  }),
);
jest.mock("@/app/_lib/hook/useContestStatusWatcher", () => ({
  useContestStatusWatcher: () => ContestStatus.IN_PROGRESS,
}));

describe("SettingsPage", () => {
  it("shows tabs and the contest settings panel initially", async () => {
    await renderWithProviders(
      <SettingsPage
        contest={MockContestWithMembersAndProblemsDTO()}
        leaderboard={MockLeaderboardResponseDTO()}
      />,
      { contest: MockContestResponseDTO() },
    );

    expect(
      screen.getByTestId("settings-contest-tab-trigger"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-problems-tab-trigger"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("settings-members-tab-trigger"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("contest-settings")).toBeInTheDocument();
  });

  it("saves successfully", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      autoFreezeAt: undefined,
    });
    const updatedContest = MockContestWithMembersAndProblemsDTO({
      slug: contest.slug,
    });
    const dashboard = MockAdminDashboardResponseDTO();
    (Composition.contestWriter.update as jest.Mock).mockResolvedValueOnce(
      updatedContest,
    );
    (
      Composition.dashboardReader.getAdminDashboard as jest.Mock
    ).mockResolvedValueOnce(dashboard);

    const { store } = await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
      />,
      { contest: contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("save-settings-button"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(Composition.contestWriter.update).toHaveBeenCalledWith(contest.id, {
      ...SettingsForm.toInputDTO(SettingsForm.fromResponseDTO(contest)),
      startAt: contest.startAt,
    });
    expect(store.getState().adminDashboard).toEqual(dashboard);
    expect(store.getState().contest).toEqual(updatedContest);
    expect(useToast().success).toHaveBeenCalledWith(
      "Settings saved successfully.",
    );
  });

  it("redirects to new path if slug has changed", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      autoFreezeAt: undefined,
    });
    const updatedContest = MockContestWithMembersAndProblemsDTO({
      slug: "new-slug",
    });
    const dashboard = MockAdminDashboardResponseDTO();
    (Composition.contestWriter.update as jest.Mock).mockResolvedValueOnce(
      updatedContest,
    );
    (
      Composition.dashboardReader.getAdminDashboard as jest.Mock
    ).mockResolvedValueOnce(dashboard);

    await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
      />,
      { contest: contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("save-settings-button"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(useNavigate()).toHaveBeenCalledWith(
      routes.CONTEST_SETTINGS(updatedContest.slug),
    );
  });

  it("shows toast on save failure", async () => {
    const contest = MockContestWithMembersAndProblemsDTO({
      autoFreezeAt: undefined,
    });
    (Composition.contestWriter.update as jest.Mock).mockRejectedValueOnce(
      new Error("Failed to update"),
    );

    await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={MockLeaderboardResponseDTO()}
      />,
      { contest: contest },
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("save-settings-button"));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId("confirmation-dialog-confirm-button"));
    });

    expect(useToast().error).toHaveBeenCalledWith("Failed to save settings.");
  });
});
