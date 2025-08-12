import { render } from "@testing-library/react";

import { ClarificationsPage } from "@/app/contests/[slug]/_common/clarifications-page";
import ContestantClarificationsPage from "@/app/contests/[slug]/contestant/clarifications/page";
import { useContestMetadata } from "@/store/slices/contest-metadata-slice";
import { useContestantDashboard } from "@/store/slices/contestant-dashboard-slice";

jest.mock("@/store/slices/contest-metadata-slice");
jest.mock("@/app/contests/[slug]/_common/clarifications-page");

describe("ContestantClarificationsPage", () => {
  it("renders the clarifications page with contest data", () => {
    const contestId = "contest-id";
    const problems = [{ id: "problem-1" }];
    const clarifications = [{ id: "clarification-1" }];

    jest
      .mocked(useContestMetadata)
      .mockReturnValueOnce({ id: contestId } as any);
    jest
      .mocked(useContestantDashboard)
      .mockReturnValueOnce(problems)
      .mockReturnValueOnce(clarifications);

    render(<ContestantClarificationsPage />);

    expect(ClarificationsPage as jest.Mock).toHaveBeenCalledWith(
      { contestId, problems, clarifications, canCreate: true },
      undefined,
    );
  });
});
