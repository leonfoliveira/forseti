import { render } from "@testing-library/react";

import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import ContestantTimelinePage from "@/app/contests/[slug]/contestant/timeline/page";

jest.mock("@/app/contests/[slug]/contestant/_context/contestant-context");
jest.mock("@/app/contests/[slug]/_common/timeline-page");

describe("ContestantTimelinePage", () => {
  it("renders the announcements page with contest data", () => {
    const submissions = [{ id: "submission-1" }, { id: "submission-2" }];
    jest
      .mocked(useContestantContext)
      .mockReturnValueOnce({ submissions } as any);

    render(<ContestantTimelinePage />);

    expect(TimelinePage as jest.Mock).toHaveBeenCalledWith(
      { submissions },
      undefined,
    );
  });
});
