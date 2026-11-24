import { screen } from "@testing-library/react";

import { SettingsPage } from "@/app/[slug]/(dashboard)/_common/settings/SettingsPage";
import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/AdminSettingsPage";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/settings/SettingsPage", () => ({
  SettingsPage: jest.fn(),
}));

describe("AdminSettingsPage", () => {
  it("passes contest and leaderboard from admin dashboard state", async () => {
    const adminDashboard = MockAdminDashboardResponseDTO();

    await renderWithProviders(<AdminSettingsPage />, {
      adminDashboard,
    });

    expect(SettingsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        contest: adminDashboard.contest,
        leaderboard: adminDashboard.leaderboard,
      }),
      undefined,
    );
  });
});
