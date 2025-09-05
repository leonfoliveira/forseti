import { screen } from "@testing-library/dom";

import DashboardSubmissionsPage from "@/app/[slug]/(dashboard)/submissions/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/submissions/admin-submissions-page",
  () => ({
    AdminSubmissionsPage: () => <span data-testid="admin-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/submissions/contestant-submissions-page",
  () => ({
    ContestantSubmissionsPage: () => <span data-testid="contestant-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/submissions/guest-submissions-page",
  () => ({
    GuestSubmissionsPage: () => <span data-testid="guest-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/submissions/judge-submissions-page",
  () => ({
    JudgeSubmissionsPage: () => <span data-testid="judge-page" />,
  }),
);

describe("DashboardSubmissionsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.CONTESTANT, "contestant-page"],
    [null, "guest-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardSubmissionsPage />, {
        authorization: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );
});
