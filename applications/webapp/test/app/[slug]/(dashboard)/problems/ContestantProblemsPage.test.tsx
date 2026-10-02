import { render, screen } from "@testing-library/react";

import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/ContestantProblemsPage";
import { MockContestantDashboardResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: ({ problems, leaderboardRow }: { problems: unknown[]; leaderboardRow?: { memberId: string } }) => (
    <div data-testid="problem-props">{`${problems.length}:${leaderboardRow?.memberId ?? "none"}`}</div>
  ),
}));

describe("ContestantProblemsPage", () => {
  it("passes contestant problems and the matching member leaderboard row", async () => {
    const dashboard = MockContestantDashboardResponseDTO();
    dashboard.leaderboard.rows[0].memberId = "member-1";
    await renderWithProviders(<ContestantProblemsPage />, {
      contestantDashboard: dashboard as never,
      session: MockSessionResponseDTO(),
    });
    expect(screen.getByTestId("problem-props")).toHaveTextContent("1:member-1");
  });
});
