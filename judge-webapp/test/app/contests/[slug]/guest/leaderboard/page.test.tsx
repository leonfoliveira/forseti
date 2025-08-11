import { render } from "@testing-library/react";

import { LeaderboardPage } from "@/app/contests/[slug]/_common/leaderboard-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";
import GuestLeaderboardPage from "@/app/contests/[slug]/guest/leaderboard/page";

jest.mock("@/app/contests/[slug]/guest/_context/guest-context");
jest.mock("@/app/contests/[slug]/_common/leaderboard-page");

describe("GuestLeaderboardPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    const leaderboard = {
      id: "leaderboard-id",
    };
    jest
      .mocked(useGuestContext)
      .mockReturnValueOnce({ contest, leaderboard } as any);

    render(<GuestLeaderboardPage />);

    expect(LeaderboardPage as jest.Mock).toHaveBeenCalledWith(
      { contest, leaderboard },
      undefined,
    );
  });
});
