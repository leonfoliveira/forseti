import { fireEvent, screen } from "@testing-library/dom";
import Joi from "joi";
import { useRouter } from "next/navigation";
import { act } from "react";

import { SettingsForm } from "@/app/[slug]/(dashboard)/_common/settings/settings-form";
import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/settings-page";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { contestWritter, leaderboardReader } from "@/config/composition";
import { routes } from "@/config/routes";
import { AdminDashboardResponseDTO } from "@/core/port/dto/response/dashboard/AdminDashboardResponseDTO";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
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
  const contestMetadata = MockContestMetadataResponseDTO({
    startAt: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    endAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
  });
  const contest = MockContestFullResponseDTO();

  beforeEach(() => {
    jest
      .spyOn(SettingsForm, "schema")
      .mockReturnValue(Joi.object().unknown(true));
  });

  it("renders correct tabs", async () => {
    await renderWithProviders(<SettingsPage contest={contest} />, {
      contestMetadata,
    });

    expect(screen.getByTestId("settings-contest-tab")).toBeInTheDocument();
    expect(
      screen.queryByTestId("settings-problems-tab"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("settings-members-tab"),
    ).not.toBeInTheDocument();
  });

  it("handle save successfully when changing contest slug", async () => {
    const newContest = MockContestFullResponseDTO({
      slug: "new-contest-slug",
    });
    (contestWritter.update as jest.Mock).mockResolvedValue(newContest);
    await renderWithProviders(<SettingsPage contest={contest} />, {
      contestMetadata,
    });

    fireEvent.click(screen.getByTestId("save-settings-button"));

    const confirmButton = await screen.findByTestId(
      "confirmation-dialog-confirm-button",
    );
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(contestWritter.update).toHaveBeenCalledWith(
      contest.id,
      expect.anything(),
    );
    expect(useRouter().push).toHaveBeenCalledWith(
      routes.CONTEST_SETTINGS(newContest.slug),
    );
  });

  it("handle save successfully when not changing contest slug", async () => {
    const newContest = MockContestFullResponseDTO();
    const leaderboard = MockLeaderboardResponseDTO();
    (contestWritter.update as jest.Mock).mockResolvedValue(newContest);
    (leaderboardReader.build as jest.Mock).mockResolvedValue(leaderboard);
    const { store } = await renderWithProviders(
      <SettingsPage contest={contest} />,
      {
        contestMetadata,
        adminDashboard: {} as unknown as AdminDashboardResponseDTO,
      },
    );

    fireEvent.click(screen.getByTestId("save-settings-button"));

    const confirmButton = await screen.findByTestId(
      "confirmation-dialog-confirm-button",
    );
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(contestWritter.update).toHaveBeenCalledWith(
      contest.id,
      expect.anything(),
    );
    expect(leaderboardReader.build).toHaveBeenCalledWith(newContest.id);
    expect(store.getState().contestMetadata).toEqual(newContest);
    expect(store.getState().adminDashboard.contest).toEqual(newContest);
    expect(store.getState().adminDashboard.leaderboard).toEqual(leaderboard);
    expect(useToast().success).toHaveBeenCalled();
  });

  it("handle save error", async () => {
    (contestWritter.update as jest.Mock).mockRejectedValue(new Error("Error"));
    await renderWithProviders(<SettingsPage contest={contest} />, {
      contestMetadata,
    });

    fireEvent.click(screen.getByTestId("save-settings-button"));

    const confirmButton = await screen.findByTestId(
      "confirmation-dialog-confirm-button",
    );
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(contestWritter.update).toHaveBeenCalledWith(
      contest.id,
      expect.anything(),
    );
    expect(useToast().error).toHaveBeenCalled();
  });
});
