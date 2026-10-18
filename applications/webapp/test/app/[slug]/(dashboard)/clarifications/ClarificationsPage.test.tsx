import { screen } from "@testing-library/dom";

import ClarificationsPage from "@/app/[slug]/(dashboard)/clarifications/ClarificationsPage";
import { MemberType } from "@/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/AdminClarificationsPage",
  () => ({
    AdminClarificationsPage: () => <span data-testid="admin-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/ContestantClarificationsPage",
  () => ({
    ContestantClarificationsPage: () => <span data-testid="contestant-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/GuestClarificationsPage",
  () => ({
    GuestClarificationsPage: () => <span data-testid="guest-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/JudgeClarificationsPage",
  () => ({
    JudgeClarificationsPage: () => <span data-testid="judge-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/clarifications/StaffClarificationsPage",
  () => ({
    StaffClarificationsPage: () => <span data-testid="staff-page" />,
  }),
);

describe("ClarificationsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.STAFF, "staff-page"],
    [MemberType.CONTESTANT, "contestant-page"],
    [null, "guest-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<ClarificationsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );
});
