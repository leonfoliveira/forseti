import { render } from "@testing-library/react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";
import GuestClarificationsPage from "@/app/contests/[slug]/guest/clarifications/page";

jest.mock("@/app/contests/[slug]/guest/_context/guest-context");
jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("GuestClarificationsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useGuestContext).mockReturnValueOnce({ contest } as any);

    render(<GuestClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contest },
      undefined,
    );
  });
});
