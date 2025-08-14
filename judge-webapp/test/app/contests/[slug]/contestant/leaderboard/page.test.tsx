import { render } from "@testing-library/react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import ContestantLeaderboardPage from "@/app/contests/[slug]/contestant/leaderboard/page";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("ContestantLeaderboardPage", () => {
  it("renders the leaderboard page with contest data", () => {
    const problems = [{ id: "problem-1" }];
    const leaderboard = {
      id: "leaderboard-id",
    };
    jest
      .mocked(useContestantDashboard)
      .mockReturnValueOnce(problems)
      .mockReturnValueOnce(leaderboard);

    render(<ContestantLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { problems, leaderboard },
      undefined,
    );
  });
});
