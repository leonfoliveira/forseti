import { render } from "@testing-library/react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";
import JudgeClarificationsPage from "@/app/contests/[slug]/judge/clarifications/page";

jest.mock("@/app/contests/[slug]/judge/_context/judge-context");
jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("JudgeClarificationsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useJudgeContext).mockReturnValueOnce({ contest } as any);

    render(<JudgeClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contest, canAnswer: true },
      undefined,
    );
  });
});
