import { render } from "@testing-library/react";

import JudgePage from "@/app/contests/[slug]/judge/page";
import { routes } from "@/config/routes";
import { mockRedirect, mockUseContestMetadata } from "@/test/jest.setup";

describe("JudgePage", () => {
  it("should redirect to judge leaderboard", () => {
    mockUseContestMetadata.mockReturnValue({
      slug: "test-contest",
    });

    render(<JudgePage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_JUDGE_LEADERBOARD("test-contest"),
    );
  });
});
