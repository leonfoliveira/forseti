import { render } from "@testing-library/react";

import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import GuestTimelinePage from "@/app/contests/[slug]/guest/timeline/page";
import { mockUseGuestDashboard } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/timeline-page");

describe("GuestTimelinePage", () => {
  it("renders the announcements page with contest data", () => {
    const submissions = [{ id: "submission-1" }, { id: "submission-2" }];

    mockUseGuestDashboard.mockImplementation((selector) => {
      const state = { contest: null, leaderboard: null, submissions };
      return selector ? selector(state) : state;
    });

    render(<GuestTimelinePage />);

    expect(TimelinePage as jest.Mock).toHaveBeenCalledWith(
      { submissions } as any,
      undefined,
    );
  });
});
