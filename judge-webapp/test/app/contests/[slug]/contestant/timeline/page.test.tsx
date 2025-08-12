import { render } from "@testing-library/react";

import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import ContestantTimelinePage from "@/app/contests/[slug]/contestant/timeline/page";
import { mockUseContestantDashboard } from "@/test/jest.setup";

jest.mock("@/app/contests/[slug]/_common/timeline-page");

describe("ContestantTimelinePage", () => {
  it("renders the announcements page with contest data", () => {
    const submissions = [{ id: "submission-1" }, { id: "submission-2" }];
    mockUseContestantDashboard.mockReturnValueOnce(submissions);

    render(<ContestantTimelinePage />);

    expect(TimelinePage as jest.Mock).toHaveBeenCalledWith(
      { submissions },
      undefined,
    );
  });
});
