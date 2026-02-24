import { LeaderboardPage } from "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page";
import { GuestLeaderboardPage } from "@/app/[slug]/(dashboard)/leaderboard/guest-leaderboard-page";
import { MockContestResponseDTO } from "@/test/mock/response/contest/MockContestResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/leaderboard/leaderboard-page",
  () => ({
    LeaderboardPage: jest.fn(),
  }),
);

describe("GuestLeaderboardPage", () => {
  it("should render common LeaderboardPage with correct data", async () => {
    const contest = MockContestResponseDTO();
    const problems = [MockProblemResponseDTO(), MockProblemResponseDTO()];
    const leaderboard = MockLeaderboardResponseDTO();
    await renderWithProviders(<GuestLeaderboardPage />, {
      contest,
      guestDashboard: {
        problems,
        leaderboard,
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
