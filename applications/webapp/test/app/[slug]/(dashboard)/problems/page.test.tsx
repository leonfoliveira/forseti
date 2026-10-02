import { render, screen } from "@testing-library/react";

import DashboardProblemsPage from "@/app/[slug]/(dashboard)/problems/page";
import { MemberType } from "@/domain/enumerate/MemberType";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/problems/AdminProblemsPage", () => ({
  AdminProblemsPage: () => <div data-testid="role-page">admin</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/problems/ContestantProblemsPage", () => ({
  ContestantProblemsPage: () => <div data-testid="role-page">contestant</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/problems/GuestProblemsPage", () => ({
  GuestProblemsPage: () => <div data-testid="role-page">guest</div>,
}));
jest.mock("@/app/[slug]/(dashboard)/problems/JudgeProblemsPage", () => ({
  JudgeProblemsPage: () => <div data-testid="role-page">judge</div>,
}));

describe("DashboardProblemsPage", () => {
  it.each([
    [MemberType.ADMIN, "admin"],
    [MemberType.ROOT, "admin"],
    [MemberType.JUDGE, "judge"],
    [MemberType.CONTESTANT, "contestant"],
  ])("selects the role-specific view for %s", async (type, expected) => {
    await renderWithProviders(<DashboardProblemsPage />, {
      session: MockSessionResponseDTO({ member: { id: "member-1", name: "Member", type } }),
    });
    expect(screen.getByTestId("role-page")).toHaveTextContent(expected);
  });

  it("uses guest problems without a session", async () => {
    await renderWithProviders(<DashboardProblemsPage />, { session: null });
    expect(screen.getByTestId("role-page")).toHaveTextContent("guest");
  });
});
