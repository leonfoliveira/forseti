import { screen } from "@testing-library/react";

import { AdminSettingsPage } from "@/app/[slug]/(dashboard)/settings/AdminSettingsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/settings/SettingsPage", () => ({
  SettingsPage: ({
    contest,
    leaderboard,
  }: {
    contest: { title: string };
    leaderboard: { rows: unknown[] };
  }) => (
    <div data-testid="settings-props">{`${contest.title}:${leaderboard.rows.length}`}</div>
  ),
}));

describe("AdminSettingsPage", () => {
  it("passes contest and leaderboard from admin dashboard state", async () => {
    await renderWithProviders(<AdminSettingsPage />, {
      adminDashboard: MockAdminDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("settings-props")).toHaveTextContent(
      "Test contest:1",
    );
  });
});
