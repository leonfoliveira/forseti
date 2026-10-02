import { render, screen } from "@testing-library/react";

import { AdminLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/AdminLeaderboardPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage", () => ({
  LeaderboardPage: ({ problems, leaderboard }: { problems: unknown[]; leaderboard: { rows: unknown[] } }) => (
    <div data-testid="leaderboard-props">{`${problems.length}:${leaderboard.rows.length}`}</div>
  ),
}));

describe("AdminLeaderboardPage", () => {
  it("passes admin dashboard problems and leaderboard to its shared page", async () => {
    await renderWithProviders(<AdminLeaderboardPage />, {
      adminDashboard: MockAdminDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("leaderboard-props")).toHaveTextContent("1:1");
  });
});
