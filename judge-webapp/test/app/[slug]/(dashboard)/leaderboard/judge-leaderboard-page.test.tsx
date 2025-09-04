import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard-page";
import { JudgeLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/judge-leaderboard-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/leaderboard-page", () => ({
  LeaderboardPage: jest.fn(),
}));

describe("JudgeLeaderboardPage", () => {
  it("should render common LeaderboardPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(<JudgeLeaderboardPage />, {
      contestMetadata,
      judgeDashboard: {
        data: { contest: { problems }, leaderboard },
      },
    } as any);

    expect(LeaderboardPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        leaderboard,
      }),
      undefined,
    );
  });
});
