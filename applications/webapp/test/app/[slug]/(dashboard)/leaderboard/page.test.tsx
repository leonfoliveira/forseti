import { screen } from "@testing-library/react";

import DashboardLeaderboardPage from "@/app/[slug]/(dashboard)/leaderboard/page";
import { MemberType } from "@/domain/enumerate/MemberType";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/leaderboard/AdminLeaderboardPage", () => ({
  AdminLeaderboardPage: () => <div data-testid="role-page">admin</div>,
}));
jest.mock(
  "@/app/[slug]/(dashboard)/leaderboard/ContestantLeaderboardPage",
  () => ({
    ContestantLeaderboardPage: () => (
      <div data-testid="role-page">contestant</div>
    ),
  }),
);
jest.mock("@/app/[slug]/(dashboard)/leaderboard/GuestLeaderboardPage", () => ({
  GuestLeaderboardPage: () => <div data-testid="role-page">guest</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/leaderboard/JudgeLeaderboardPage", () => ({
  JudgeLeaderboardPage: () => <div data-testid="role-page">judge</div>,
}));

describe("DashboardLeaderboardPage", () => {
  it.each([
    [MemberType.ADMIN, "admin"],
    [MemberType.ROOT, "admin"],
    [MemberType.JUDGE, "judge"],
    [MemberType.CONTESTANT, "contestant"],
  ])("selects the role-specific view for %s", async (type, expected) => {
    await renderWithProviders(<DashboardLeaderboardPage />, {
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Member", type },
      }),
    });
    expect(screen.getByTestId("role-page")).toHaveTextContent(expected);
  });

  it("uses the guest view without a session", async () => {
    await renderWithProviders(<DashboardLeaderboardPage />, { session: null });
    expect(screen.getByTestId("role-page")).toHaveTextContent("guest");
  });
});
