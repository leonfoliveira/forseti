import { screen } from "@testing-library/react";

import { SpectatorLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/SpectatorLeaderboardPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockSpectatorDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/leaderboard/LeaderboardPage",
  () => ({
    LeaderboardPage: ({
      problems,
      leaderboard,
    }: {
      problems: unknown[];
      leaderboard: { rows: unknown[] };
    }) => (
      <div data-testid="leaderboard-props">{`${problems.length}:${leaderboard.rows.length}`}</div>
    ),
  }),
);

describe("SpectatorLeaderboardPage", () => {
  it("passes spectator dashboard data to the shared page", async () => {
    await renderWithProviders(<SpectatorLeaderboardPage />, {
      spectatorDashboard: MockSpectatorDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("leaderboard-props")).toHaveTextContent("1:1");
  });
});
