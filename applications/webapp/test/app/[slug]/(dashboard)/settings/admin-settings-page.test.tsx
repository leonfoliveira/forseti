import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/settings-page";
import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/admin-settings-page";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/settings/settings-page", () => ({
  SettingsPage: jest.fn(),
}));

describe("AdminSettingsPage", () => {
  it("should render common SettingsPage with correct data", async () => {
    const contest = MockContestFullResponseDTO();
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(<AdminSettingsPage />, {
      adminDashboard: {
        contest,
        leaderboard,
      },
    } as any);

    expect(SettingsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contest,
        leaderboard,
        onToggleFreeze: expect.any(Function),
      }),
      undefined,
    );
  });
});
