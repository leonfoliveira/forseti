import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/problems-page";
import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/contestant-problems-page";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/problems-page", () => ({
  ProblemsPage: jest.fn(),
}));

describe("ContestantProblemsPage", () => {
  it("should render common ProblemsPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(<ContestantProblemsPage />, {
      contest,
      session: { member: { id: leaderboard.rows[0].memberId } },
      contestantDashboard: {
        problems,
        leaderboard,
      },
    } as any);

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        leaderboardRow: leaderboard.rows[0],
      }),
      undefined,
    );
  });
});
