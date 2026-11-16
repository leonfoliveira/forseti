import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/ContestantProblemsPage";
import {
  MockContestantDashboardResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: jest.fn(),
}));

describe("ContestantProblemsPage", () => {
  it("passes contestant problems and the matching member leaderboard row", async () => {
    const session = MockSessionResponseDTO();
    const dashboard = MockContestantDashboardResponseDTO();
    dashboard.leaderboard.rows[0].memberId = session.member.id;

    await renderWithProviders(<ContestantProblemsPage />, {
      contestantDashboard: dashboard,
      session,
    });

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems: dashboard.problems,
        leaderboardRow: dashboard.leaderboard.rows[0],
      }),
      undefined,
    );
  });
});
