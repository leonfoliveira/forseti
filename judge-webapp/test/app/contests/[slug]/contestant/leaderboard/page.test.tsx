import { render } from "@testing-library/react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import ContestantLeaderboardPage from "@/app/contests/[slug]/contestant/leaderboard/page";

jest.mock("@/app/contests/[slug]/contestant/_context/contestant-context");
jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("ContestantLeaderboardPage", () => {
  it("renders the leaderboard page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    const leaderboard = {
      id: "leaderboard-id",
    };
    (useContestantContext as jest.Mock).mockReturnValue({
      contest,
      leaderboard,
    } as any);

    render(<ContestantLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { contest, leaderboard },
      undefined,
    );
  });
});
