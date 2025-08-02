import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";
import { render } from "@testing-library/react";
import JudgeLeaderboardPage from "@/app/contests/[slug]/judge/leaderboard/page";
import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";

jest.mock("@/app/contests/[slug]/judge/_context/judge-context");
jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("JudgeLeaderboardPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    const leaderboard = {
      id: "leaderboard-id",
    };
    jest
      .mocked(useJudgeContext)
      .mockReturnValueOnce({ contest, leaderboard } as any);

    render(<JudgeLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { contest, leaderboard },
      undefined,
    );
  });
});
