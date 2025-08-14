import { render } from "@testing-library/react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import JudgeProblemsPage from "@/app/contests/[slug]/judge/problems/page";
import { mockUseJudgeDashboard } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/problems-page");

describe("JudgeProblemsPage", () => {
  it("renders the announcements page with contest data", () => {
    const problems = [{ id: "problem-1" }];

    mockUseJudgeDashboard.mockImplementation((selector: any) => {
      const state = {
        contest: { problems },
        leaderboard: null,
        submissions: [],
      };
      return selector ? selector(state) : state;
    });

    render(<JudgeProblemsPage />);

    expect(ProblemsPage as jest.Mock).toHaveBeenCalledWith(
      { problems },
      undefined,
    );
  });
});
