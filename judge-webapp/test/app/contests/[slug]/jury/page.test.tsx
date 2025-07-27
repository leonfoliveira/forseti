import { render } from "@testing-library/react";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";
import JuryPage from "@/app/contests/[slug]/jury/page";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
    slug: "test-contest",
  })),
}));

describe("JuryPage", () => {
  it("should redirect to jury leaderboard", () => {
    render(<JuryPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_JURY_LEADERBOARD("test-contest"),
    );
  });
});
