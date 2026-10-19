import { screen } from "@testing-library/react";

import { StaffLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/StaffLeaderboardPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

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

describe("StaffLeaderboardPage", () => {
  it("passes staff dashboard data to the shared page", async () => {
    await renderWithProviders(<StaffLeaderboardPage />, {
      staffDashboard: MockStaffDashboardResponseDTO(),
    });
    expect(screen.getByTestId("leaderboard-props")).toHaveTextContent("1:1");
  });
});
