import { render } from "@testing-library/react";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";
import JudgePage from "@/app/contests/[slug]/judge/page";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
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
