import { render } from "@testing-library/react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import JudgeLeaderboardPage from "@/app/contests/[slug]/judge/leaderboard/page";
import { mockUseJudgeDashboard } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("JudgeLeaderboardPage", () => {
  it("renders the announcements page with contest data", () => {
    const problems = [{ id: "problem-1" }];
    const leaderboard = {
      id: "leaderboard-id",
    };

    mockUseJudgeDashboard.mockImplementation((selector: any) => {
      const state = { contest: { problems }, leaderboard, submissions: [] };
      return selector ? selector(state) : state;
    });

    render(<JudgeLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { problems, leaderboard },
      undefined,
    );
  });
});
