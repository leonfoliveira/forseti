import { render, screen } from "@testing-library/react";

import { ContestantLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/ContestantLeaderboardPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage", () => ({
  LeaderboardPage: ({ problems, leaderboard }: { problems: unknown[]; leaderboard: { rows: unknown[] } }) => (
    <div data-testid="leaderboard-props">{`${problems.length}:${leaderboard.rows.length}`}</div>
  ),
}));

describe("ContestantLeaderboardPage", () => {
  it("passes contestant dashboard data to the shared page", async () => {
    await renderWithProviders(<ContestantLeaderboardPage />, {
      contestantDashboard: MockContestantDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("leaderboard-props")).toHaveTextContent("1:1");
  });
});
