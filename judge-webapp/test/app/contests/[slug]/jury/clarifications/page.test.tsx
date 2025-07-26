import { useJuryContext } from "@/app/contests/[slug]/jury/_context/jury-context";
import { render } from "@testing-library/react";
import JuryClarificationsPage from "@/app/contests/[slug]/jury/clarifications/page";
import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";

jest.mock("@/app/contests/[slug]/jury/_context/jury-context");
jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("JuryClarificationsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useJuryContext).mockReturnValueOnce({ contest } as any);

    render(<JuryClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contest, canAnswer: true },
      undefined,
    );
  });
});
