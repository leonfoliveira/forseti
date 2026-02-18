import { screen } from "@testing-library/dom";

import DashboardClarificationsPage from "@/app/[slug]/(dashboard)/clarifications/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/admin-clarifications-page",
  () => ({
    AdminClarificationsPage: () => <span data-testid="admin-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/staff-clarifications-page",
  () => ({
    StaffClarificationsPage: () => <span data-testid="staff-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/contestant-clarifications-page",
  () => ({
    ContestantClarificationsPage: () => <span data-testid="contestant-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/guest-clarifications-page",
  () => ({
    GuestClarificationsPage: () => <span data-testid="guest-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/judge-clarifications-page",
  () => ({
    JudgeClarificationsPage: () => <span data-testid="judge-page" />,
  }),
);

describe("DashboardClarificationsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.STAFF, "staff-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.CONTESTANT, "contestant-page"],
    [null, "guest-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardClarificationsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );
});
