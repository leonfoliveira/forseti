import { render } from "@testing-library/react";

import GuestPage from "@/app/contests/[slug]/guest/page";
import { routes } from "@/config/routes";
import { mockRedirect, mockUseContestMetadata } from "@/test/jest.setup";

describe("GuestPage", () => {
  it("should redirect to guest leaderboard", () => {
    mockUseContestMetadata.mockReturnValue({
      slug: "test-contest",
    });

    render(<GuestPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_GUEST_LEADERBOARD("test-contest"),
    );
  });
});
