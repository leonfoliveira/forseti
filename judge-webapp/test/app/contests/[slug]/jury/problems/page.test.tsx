import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";
import { render } from "@testing-library/react";
import JuryProblemsPage from "@/app/contests/[slug]/jury/problems/page";
import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";

jest.mock("@/app/contests/[slug]/jury/_context/jury-context");
jest.mock("@/app/contests/[slug]/_common/problems-page");

describe("JuryProblemsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useJuryContext).mockReturnValueOnce({ contest } as any);

    render(<JuryProblemsPage />);

    expect(ProblemsPage as jest.Mock).toHaveBeenCalledWith(
      { contest },
      undefined,
    );
  });
});
