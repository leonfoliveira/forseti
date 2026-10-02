import { render, screen } from "@testing-library/react";

import { JudgeLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/JudgeLeaderboardPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage", () => ({
  LeaderboardPage: ({ problems, leaderboard }: { problems: unknown[]; leaderboard: { rows: unknown[] } }) => (
    <div data-testid="leaderboard-props">{`${problems.length}:${leaderboard.rows.length}`}</div>
  ),
}));

describe("JudgeLeaderboardPage", () => {
  it("passes judge dashboard data to the shared page", async () => {
    await renderWithProviders(<JudgeLeaderboardPage />, {
      judgeDashboard: MockJudgeDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("leaderboard-props")).toHaveTextContent("1:1");
  });
});
