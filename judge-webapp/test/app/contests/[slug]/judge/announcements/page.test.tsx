import { render } from "@testing-library/react";

import { AnnouncementsPage } from "@/app/contests/[slug]/_common/announcements-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";
import JudgeAnnouncementsPage from "@/app/contests/[slug]/judge/announcements/page";

jest.mock("@/app/contests/[slug]/judge/_context/judge-context");
jest.mock("@/app/contests/[slug]/_common/announcements-page");

describe("JudgeAnnouncementsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useJudgeContext).mockReturnValueOnce({ contest } as any);

    render(<JudgeAnnouncementsPage />);

    expect(AnnouncementsPage as jest.Mock).toHaveBeenCalledWith(
      { contest, canCreate: true },
      undefined,
    );
  });
});
