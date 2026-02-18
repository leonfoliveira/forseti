import { screen } from "@testing-library/dom";
import { forbidden } from "next/navigation";

import DashboardTicketsPage from "@/app/[slug]/(dashboard)/tickets/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/tickets/admin-tickets-page", () => ({
  AdminTicketsPage: () => <span data-testid="admin-page" />,
}));
jest.mock("@/app/[slug]/(dashboard)/tickets/staff-tickets-page", () => ({
  StaffTicketsPage: () => <span data-testid="staff-page" />,
}));
jest.mock("@/app/[slug]/(dashboard)/tickets/contestant-tickets-page", () => ({
  ContestantTicketsPage: () => <span data-testid="contestant-page" />,
}));
jest.mock("@/app/[slug]/(dashboard)/tickets/judge-tickets-page", () => ({
  JudgeTicketsPage: () => <span data-testid="judge-page" />,
}));

describe("DashboardTicketsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.STAFF, "staff-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.CONTESTANT, "contestant-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardTicketsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );

  it("should call forbidden for guest member", async () => {
    await renderWithProviders(<DashboardTicketsPage />, {
      session: null,
    } as any);

    expect(forbidden).toHaveBeenCalled();
  });
});
