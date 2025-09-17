import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems-page";
import { ContestantProblemsPage } from "@/app/[slug]/(dashboard)/problems/contestant-problems-page";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemPublicResponseDTO } from "@/test/mock/response/problem/MockProblemPublicResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems-page", () => ({
  ProblemsPage: jest.fn(),
}));

describe("ContestantProblemsPage", () => {
  it("should render common ProblemsPage with correct data", async () => {
    const contestMetadata = MockContestMetadataResponseDTO();
    const problems = [
      MockProblemPublicResponseDTO(),
      MockProblemPublicResponseDTO(),
    ];
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(<ContestantProblemsPage />, {
      contestMetadata,
      session: { member: { id: leaderboard.members[0].id } },
      contestantDashboard: {
        contest: { problems },
        leaderboard,
      },
    } as any);

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems,
        contestantClassificationProblems: leaderboard.members[0].problems,
      }),
      undefined,
    );
  });
});
