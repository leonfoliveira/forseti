import { render } from "@testing-library/react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useJudgeContext } from "@/app/contests/[slug]/judge/_context/judge-context";
import JudgeProblemsPage from "@/app/contests/[slug]/judge/problems/page";

jest.mock("@/app/contests/[slug]/judge/_context/judge-context");
jest.mock("@/app/contests/[slug]/_common/problems-page");

describe("JudgeProblemsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useJudgeContext).mockReturnValueOnce({ contest } as any);

    render(<JudgeProblemsPage />);

    expect(ProblemsPage as jest.Mock).toHaveBeenCalledWith(
      { contest },
      undefined,
    );
  });
});
