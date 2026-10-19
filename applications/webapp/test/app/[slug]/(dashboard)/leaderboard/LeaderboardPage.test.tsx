import { screen } from "@testing-library/react";

import LeaderboardPage from "@/app/[slug]/(dashboard)/leaderboard/LeaderboardPage";
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
jest.mock(
  "@/app/[slug]/(dashboard)/leaderboard/SpectatorLeaderboardPage",
  () => ({
    SpectatorLeaderboardPage: () => (
      <div data-testid="role-page">spectator</div>
    ),
  }),
);
jest.mock("@/app/[slug]/(dashboard)/leaderboard/JudgeLeaderboardPage", () => ({
  JudgeLeaderboardPage: () => <div data-testid="role-page">judge</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/leaderboard/StaffLeaderboardPage", () => ({
  StaffLeaderboardPage: () => <div data-testid="role-page">staff</div>,
}));

describe("LeaderboardPage", () => {
  it.each([
    [MemberType.ROOT, "admin"],
    [MemberType.ADMIN, "admin"],
    [MemberType.JUDGE, "judge"],
    [MemberType.STAFF, "staff"],
    [MemberType.CONTESTANT, "contestant"],
    [null, "spectator"],
  ])("selects the role-specific view for %s", async (type, expected) => {
    await renderWithProviders(<LeaderboardPage />, {
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Member", type },
      } as any),
    });
    expect(screen.getByTestId("role-page")).toHaveTextContent(expected);
  });

  it("uses the spectator view without a session", async () => {
    await renderWithProviders(<LeaderboardPage />, { session: null });
    expect(screen.getByTestId("role-page")).toHaveTextContent("spectator");
  });
});
