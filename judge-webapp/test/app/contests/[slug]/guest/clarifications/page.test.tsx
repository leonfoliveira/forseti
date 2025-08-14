import { render } from "@testing-library/react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import GuestClarificationsPage from "@/app/contests/[slug]/guest/clarifications/page";
import {
  mockUseContestMetadata,
  mockUseGuestDashboard,
} from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("GuestClarificationsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contestId = "contest-id";
    const problems = [{ id: "problem-1" }];
    const clarifications = [{ id: "clarification-1" }];

    mockUseContestMetadata.mockReturnValue({ id: contestId });
    mockUseGuestDashboard.mockImplementation((selector: any) => {
      const state = {
        contest: { problems, clarifications },
        leaderboard: null,
        submissions: [],
      };
      return selector ? selector(state) : state;
    });

    render(<GuestClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contestId, problems, clarifications },
      undefined,
    );
  });
});
