import { useContestantContext } from "@/app/contests/[slug]/contestant/_context/contestant-context";
import { render } from "@testing-library/react";
import ContestantClarificationsPage from "@/app/contests/[slug]/contestant/clarifications/page";
import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";

jest.mock("@/app/contests/[slug]/contestant/_context/contestant-context");
jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("ContestantClarificationsPage", () => {
  it("renders the clarifications page with contest data", () => {
    const contest = {
      id: "contest-id",
    };
    jest.mocked(useContestantContext).mockReturnValueOnce({ contest } as any);

    render(<ContestantClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contest, canCreate: true },
      undefined,
    );
  });
});
