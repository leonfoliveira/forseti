import { render, screen } from "@testing-library/react";

import { GuestLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/GuestLeaderboardPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage", () => ({
  LeaderboardPage: ({ problems, leaderboard }: { problems: unknown[]; leaderboard: { rows: unknown[] } }) => (
    <div data-testid="leaderboard-props">{`${problems.length}:${leaderboard.rows.length}`}</div>
  ),
}));

describe("GuestLeaderboardPage", () => {
  it("passes guest dashboard data to the shared page", async () => {
    await renderWithProviders(<GuestLeaderboardPage />, {
      guestDashboard: MockGuestDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("leaderboard-props")).toHaveTextContent("1:1");
  });
});
