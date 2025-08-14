import { render } from "@testing-library/react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import JudgeClarificationsPage from "@/app/contests/[slug]/judge/clarifications/page";
import {
  mockUseContestMetadata,
  mockUseJudgeDashboard,
} from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("JudgeClarificationsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contestId = "contest-id";
    const problems = [{ id: "problem-1" }];
    const clarifications = [{ id: "clarification-1" }];

    mockUseContestMetadata.mockReturnValue({ id: contestId });
    mockUseJudgeDashboard.mockImplementation((selector: any) => {
      const state = {
        contest: { problems, clarifications },
        leaderboard: null,
        submissions: [],
      };
      return selector ? selector(state) : state;
    });

    render(<JudgeClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contestId, problems, clarifications, canAnswer: true },
      undefined,
    );
  });
});
