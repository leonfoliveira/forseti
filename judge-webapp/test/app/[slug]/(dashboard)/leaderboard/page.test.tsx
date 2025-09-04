import { screen } from "@testing-library/dom";

import DashboardLeaderboardPage from "@/app/[slug]/(dashboard)/leaderboard/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/leaderboard/admin-leaderboard-page",
  () => ({
    AdminLeaderboardPage: () => <span data-testid="admin-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/leaderboard/contestant-leaderboard-page",
  () => ({
    ContestantLeaderboardPage: () => <span data-testid="contestant-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/leaderboard/guest-leaderboard-page",
  () => ({
    GuestLeaderboardPage: () => <span data-testid="guest-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/leaderboard/judge-leaderboard-page",
  () => ({
    JudgeLeaderboardPage: () => <span data-testid="judge-page" />,
  }),
);

describe("DashboardLeaderboardPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.CONTESTANT, "contestant-page"],
    [null, "guest-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardLeaderboardPage />, {
        authorization: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );
});
