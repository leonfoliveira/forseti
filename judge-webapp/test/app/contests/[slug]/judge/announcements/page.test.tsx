import { render } from "@testing-library/react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import JudgeAnnouncementsPage from "@/app/contests/[slug]/judge/announcements/page";
import {
  mockUseContestMetadata,
  mockUseJudgeDashboard,
} from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("JudgeAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contestId = "contest-id";
    const announcements = [{ id: "announcement-1" }];

    mockUseContestMetadata.mockReturnValue({ id: contestId });
    mockUseJudgeDashboard.mockImplementation((selector: any) => {
      const state = {
        contest: { announcements },
        leaderboard: null,
        submissions: [],
      };
      return selector ? selector(state) : state;
    });

    render(<JudgeAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contestId, announcements, canCreate: true },
      undefined,
    );
  });
});
