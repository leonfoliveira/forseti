import { render } from "@testing-library/react";

import { ProblemsPage } from "@/app/contests/[slug]/_common/problems-page";
import { useGuestContext } from "@/app/contests/[slug]/guest/_context/guest-context";
import GuestProblemsPage from "@/app/contests/[slug]/guest/problems/page";

jest.mock("@/app/contests/[slug]/guest/_context/guest-context");
jest.mock("@/app/contests/[slug]/_common/problems-page");

describe("GuestProblemsPage", () => {
  it("renders the announcements page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useGuestContext).mockReturnValueOnce({ contest } as any);

    render(<GuestProblemsPage />);

    expect(ProblemsPage as jest.Mock).toHaveBeenCalledWith(
      { contest },
      undefined,
    );
  });
});
