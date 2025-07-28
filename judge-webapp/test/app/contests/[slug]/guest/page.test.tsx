import { render } from "@testing-library/react";
import { mockRedirect } from "@/test/jest.setup";
import { routes } from "@/config/routes";
import GuestPage from "@/app/contests/[slug]/guest/page";

jest.mock("@/app/contests/[slug]/_context/contest-metadata-context", () => ({
  useContestMetadata: jest.fn(() => ({
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
