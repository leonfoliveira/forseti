import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";
import { render } from "@testing-library/react";
import JuryAnnouncementsPage from "@/app/contests/[slug]/jury/announcements/page";
import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";

jest.mock("@/app/contests/[slug]/jury/_context/jury-context");
jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("JuryAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useJuryContext).mockReturnValueOnce({ contest } as any);

    render(<JuryAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contest, canCreate: true },
      undefined,
    );
  });
});
