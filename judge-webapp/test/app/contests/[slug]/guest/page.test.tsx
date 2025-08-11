import { render } from "@testing-library/react";

import GuestPage from "@/app/contests/[slug]/guest/page";
import { routes } from "@/config/routes";
import { mockRedirect } from "@/test/jest.setup";

jest.mock("@/store/slices/contest-slice", () => ({
  useContest: jest.fn(() => ({
    slug: "test-contest",
  })),
}));

describe("GuestPage", () => {
  it("should redirect to guest leaderboard", () => {
    render(<GuestPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_GUEST_LEADERBOARD("test-contest"),
    );
  });
});
