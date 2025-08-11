import { render } from "@testing-library/react";

import ContestantPage from "@/app/contests/[slug]/contestant/page";
import { routes } from "@/config/routes";
import { mockRedirect } from "@/test/jest.setup";

jest.mock("@/store/slices/contest-slice", () => ({
  useContest: jest.fn(() => ({
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
