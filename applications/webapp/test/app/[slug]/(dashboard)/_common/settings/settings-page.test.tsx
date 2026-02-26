import { fireEvent, screen } from "@testing-library/dom";
import Joi from "joi";
import { useRouter } from "next/navigation";
import { act } from "react";

import { SettingsForm } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/settings-page";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { AdminDashboardState } from "@/app/_store/slices/dashboard/admin-dashboard-slice";
import { Composition } from "@/config/composition";
import { routes } from "@/config/routes";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { MockDate } from "@/test/mock/mock-date";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockContestWithMembersAndProblemsDTO } from "@/test/mock/response/contest/MockContestWithMembersAndProblemsDTO";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/dashboard/MockAdminDashboardResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/settings/settings-page-contest-tab",
  () => ({
    SettingsPageContestTab: () => <div data-testid="settings-contest-tab" />,
  }),
);

jest.mock(
  "@/app/[slug]/(dashboard)/_common/settings/settings-page-problems-tab",
  () => ({
    SettingsPageProblemsTab: () => <div data-testid="settings-problems-tab" />,
  }),
);

jest.mock(
  "@/app/[slug]/(dashboard)/_common/settings/settings-page-members-tab",
  () => ({
    SettingsPageMembersTab: () => <div data-testid="settings-members-tab" />,
  }),
);

describe("SettingsPage", () => {
  const contestMetadata = MockContestResponseDTO({
    startAt: MockDate.future().toISOString(),
    endAt: MockDate.future(2).toISOString(),
  });
  const contest = MockContestWithMembersAndProblemsDTO();

  beforeEach(() => {
    jest
      .spyOn(SettingsForm, "schema")
      .mockReturnValue(Joi.object().unknown(true));
  });

  it("renders correct tabs", async () => {
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={leaderboard}
        onToggleFreeze={() => {}}
      />,
      {
        contest: contestMetadata,
      },
    );

    expect(screen.getByTestId("settings-contest-tab")).toBeInTheDocument();
    expect(
      screen.queryByTestId("settings-problems-tab"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("settings-members-tab"),
    ).not.toBeInTheDocument();
  });

  it("handle save successfully when changing contest slug", async () => {
    const newContest = MockContestWithMembersAndProblemsDTO({
      slug: "new-contest-slug",
    });
    const leaderboard = MockLeaderboardResponseDTO();
    (Composition.contestWritter.update as jest.Mock).mockResolvedValue(
      newContest,
    );
    await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={leaderboard}
        onToggleFreeze={() => {}}
      />,
      {
        contest: contestMetadata,
      },
    );

    fireEvent.click(screen.getByTestId("save-settings-button"));

    const confirmButton = await screen.findByTestId(
      "confirmation-dialog-confirm-button",
    );
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(Composition.contestWritter.update).toHaveBeenCalledWith(
      contest.id,
      expect.anything(),
    );
    expect(useRouter().push).toHaveBeenCalledWith(
      routes.CONTEST_SETTINGS(newContest.slug),
    );
  });

  it("handle save successfully when not changing contest slug", async () => {
    const dashboard = MockAdminDashboardResponseDTO();
    const newContest = MockContestWithMembersAndProblemsDTO();
    const leaderboard = MockLeaderboardResponseDTO();
    (Composition.contestWritter.update as jest.Mock).mockResolvedValue(
      newContest,
    );
    (
      Composition.dashboardReader.getAdminDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
    const { store } = await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={leaderboard}
        onToggleFreeze={() => {}}
      />,
      {
        contest: contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardState,
      },
    );

    fireEvent.click(screen.getByTestId("save-settings-button"));

    const confirmButton = await screen.findByTestId(
      "confirmation-dialog-confirm-button",
    );
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(Composition.contestWritter.update).toHaveBeenCalledWith(
      contest.id,
      expect.anything(),
    );
    expect(Composition.dashboardReader.getAdminDashboard).toHaveBeenCalledWith(
      contest.id,
    );
    expect(store.getState().adminDashboard).toEqual({
      ...dashboard,
      listenerStatus: ListenerStatus.CONNECTED,
    });
    expect(useToast().success).toHaveBeenCalled();
  });

  it("handle save error", async () => {
    (Composition.contestWritter.update as jest.Mock).mockRejectedValue(
      new Error("Error"),
    );
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(
      <SettingsPage
        contest={contest}
        leaderboard={leaderboard}
        onToggleFreeze={() => {}}
      />,
      {
        contest: contestMetadata,
      },
    );

    fireEvent.click(screen.getByTestId("save-settings-button"));

    const confirmButton = await screen.findByTestId(
      "confirmation-dialog-confirm-button",
    );
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(Composition.contestWritter.update).toHaveBeenCalledWith(
      contest.id,
      expect.anything(),
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
