import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";
import { render } from "@testing-library/react";
import JuryLeaderboardPage from "@/app/contests/[slug]/jury/leaderboard/page";
import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";

jest.mock("@/app/contests/[slug]/jury/_context/jury-context");
jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("JuryLeaderboardPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    const leaderboard = {
      id: "leaderboard-id",
    };
    jest
      .mocked(useJuryContext)
      .mockReturnValueOnce({ contest, leaderboard } as any);

    render(<JuryLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { contest, leaderboard },
      undefined,
    );
  });
});
