import { render } from "@testing-library/react";

import ContestantPage from "@/app/contests/[slug]/contestant/page";
import { routes } from "@/config/routes";
import { mockRedirect, mockUseContestMetadata } from "@/test/jest.setup";

jest.mock("@/store/slices/contest-metadata-slice");

describe("ContestantPage", () => {
  it("should redirect to contestant leaderboard", () => {
    mockUseContestMetadata.mockReturnValue({
      slug: "test-contest",
    } as any);

    render(<ContestantPage />);

    expect(mockRedirect).toHaveBeenCalledWith(
      routes.CONTEST_CONTESTANT_LEADERBOARD("test-contest"),
    );
  });
});
