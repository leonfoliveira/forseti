import { render } from "@testing-library/react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";
import GuestAnnouncementsPage from "@/app/contests/[slug]/guest/announcements/page";

jest.mock("@/app/contests/[slug]/guest/_context/guest-context");
jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("GuestAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useGuestContext).mockReturnValueOnce({ contest } as any);

    render(<GuestAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contest },
      undefined,
    );
  });
});
