import { render } from "@testing-library/react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import GuestLeaderboardPage from "@/app/contests/[slug]/guest/leaderboard/page";
import { mockUseGuestDashboard } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("GuestLeaderboardPage", () => {
  it("renders the announcements page with contest data", () => {
    const problems = [{ id: "problem-1" }];
    const leaderboard = {
      id: "leaderboard-id",
    };

    mockUseGuestDashboard.mockImplementation((selector: any) => {
      const state = { contest: { problems }, leaderboard, submissions: [] };
      return selector ? selector(state) : state;
    });

    render(<GuestLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { problems, leaderboard },
      undefined,
    );
  });
});
