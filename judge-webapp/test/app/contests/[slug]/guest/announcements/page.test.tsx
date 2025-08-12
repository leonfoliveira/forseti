import { render } from "@testing-library/react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import GuestAnnouncementsPage from "@/app/contests/[slug]/guest/announcements/page";
import {
  mockUseContestMetadata,
  mockUseGuestDashboard,
} from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("GuestAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contestId = "contest-id";
    const announcements = [{ id: "announcement-1" }];

    mockUseContestMetadata.mockReturnValue({ id: contestId });
    mockUseGuestDashboard.mockImplementation((selector) => {
      const state = {
        contest: { announcements },
        leaderboard: null,
        submissions: [],
      };
      return selector ? selector(state) : state;
    });

    render(<GuestAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contestId, announcements },
      undefined,
    );
  });
});
