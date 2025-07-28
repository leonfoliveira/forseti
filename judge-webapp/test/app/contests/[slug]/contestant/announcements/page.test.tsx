import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { render } from "@testing-library/react";
import ContestantAnnouncementsPage from "@/app/contests/[slug]/contestant/announcements/page";
import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";

jest.mock("@/app/contests/[slug]/contestant/_context/contestant-context");
jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("ContestantAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useContestantContext).mockReturnValueOnce({ contest } as any);

    render(<ContestantAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contest },
      undefined,
    );
  });
});
