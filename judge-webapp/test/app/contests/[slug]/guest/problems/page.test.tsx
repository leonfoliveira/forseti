import { render } from "@testing-library/react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import GuestProblemsPage from "@/app/contests/[slug]/guest/problems/page";
import { mockUseGuestDashboard } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/problems-page");

describe("GuestProblemsPage", () => {
  it("renders the announcements page with contest data", () => {
    const problems = [{ id: "problem-1" }];

    mockUseGuestDashboard.mockImplementation((selector: any) => {
      const state = {
        contest: { problems },
        leaderboard: null,
        submissions: [],
      };
      return selector ? selector(state) : state;
    });

    render(<GuestProblemsPage />);

    expect(ProblemsPage as jest.Mock).toHaveBeenCalledWith(
      { problems },
      undefined,
    );
  });
});
