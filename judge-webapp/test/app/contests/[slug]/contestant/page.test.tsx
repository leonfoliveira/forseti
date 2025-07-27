import { render } from "@testing-library/react";
import ContestantPage from "@/app/contests/[slug]/contestant/page";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
    slug: "test-contest",
  })),
}));

describe("ContestantPage", () => {
  it("should redirect to contestant leaderboard", () => {
    render(<ContestantPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_CONTESTANT_LEADERBOARD("test-contest"),
    );
  });
});
