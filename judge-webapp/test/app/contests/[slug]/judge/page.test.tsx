import { render } from "@testing-library/react";

import JudgePage from "@/app/contests/[slug]/judge/page";
import { routes } from "@/config/routes";
import { mockRedirect } from "@/test/jest.setup";

jest.mock("@/store/slices/contest-slice", () => ({
  useContest: jest.fn(() => ({
    slug: "test-contest",
  })),
}));

describe("JudgePage", () => {
  it("should redirect to judge leaderboard", () => {
    render(<JudgePage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_JUDGE_LEADERBOARD("test-contest"),
    );
  });
});
