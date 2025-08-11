import { render } from "@testing-library/react";

import { TimelinePage } from "@/app/contests/[slug]/_common/timeline-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";
import GuestTimelinePage from "@/app/contests/[slug]/guest/timeline/page";

jest.mock("@/app/contests/[slug]/guest/_context/guest-context");
jest.mock("@/app/contests/[slug]/_common/timeline-page");

describe("GuestTimelinePage", () => {
  it("renders the announcements page with contest data", () => {
    const submissions = [{ id: "submission-1" }, { id: "submission-2" }];
    jest.mocked(useGuestContext).mockReturnValueOnce({ submissions } as any);

    render(<GuestTimelinePage />);

    expect(TimelinePage as jest.Mock).toHaveBeenCalledWith(
      { submissions } as any,
      undefined,
    );
  });
});
