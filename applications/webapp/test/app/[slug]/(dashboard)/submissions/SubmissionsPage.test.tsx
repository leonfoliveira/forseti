import { screen } from "@testing-library/react";

import SubmissionsPage from "@/app/[slug]/(dashboard)/submissions/SubmissionsPage";
import { MemberType } from "@/domain/enumerate/MemberType";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/submissions/AdminSubmissionsPage", () => ({
  AdminSubmissionsPage: () => <div data-testid="role-page">admin</div>,
}));
jest.mock(
  "@/app/[slug]/(dashboard)/submissions/ContestantSubmissionsPage",
  () => ({
    ContestantSubmissionsPage: () => (
      <div data-testid="role-page">contestant</div>
    ),
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/submissions/SpectatorSubmissionsPage",
  () => ({
    SpectatorSubmissionsPage: () => (
      <div data-testid="role-page">spectator</div>
    ),
  }),
);
jest.mock("@/app/[slug]/(dashboard)/submissions/JudgeSubmissionsPage", () => ({
  JudgeSubmissionsPage: () => <div data-testid="role-page">judge</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/submissions/StaffSubmissionsPage", () => ({
  StaffSubmissionsPage: () => <div data-testid="role-page">staff</div>,
}));

describe("SubmissionsPage", () => {
  it.each([
    [MemberType.ADMIN, "admin"],
    [MemberType.ROOT, "admin"],
    [MemberType.JUDGE, "judge"],
    [MemberType.STAFF, "staff"],
    [MemberType.CONTESTANT, "contestant"],
    [null, "spectator"],
  ])("selects the role-specific view for %s", async (type, expected) => {
    await renderWithProviders(<SubmissionsPage />, {
      session: MockSessionResponseDTO({
        member: { id: "member-1", name: "Member", type },
      } as any),
    });
    expect(screen.getByTestId("role-page")).toHaveTextContent(expected);
  });

  it("uses spectator submissions without a session", async () => {
    await renderWithProviders(<SubmissionsPage />, { session: null });
    expect(screen.getByTestId("role-page")).toHaveTextContent("spectator");
  });
});
