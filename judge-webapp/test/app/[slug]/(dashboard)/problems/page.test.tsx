import { screen } from "@testing-library/dom";

import DashboardProblemsPage from "@/app/[slug]/(dashboard)/problems/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/problems/admin-problems-page", () => ({
  AdminProblemsPage: () => <span data-testid="admin-page" />,
}));
jest.mock("@/app/[slug]/(dashboard)/problems/contestant-problems-page", () => ({
  ContestantProblemsPage: () => <span data-testid="contestant-page" />,
}));
jest.mock("@/app/[slug]/(dashboard)/problems/guest-problems-page", () => ({
  GuestProblemsPage: () => <span data-testid="guest-page" />,
}));
jest.mock("@/app/[slug]/(dashboard)/problems/judge-problems-page", () => ({
  JudgeProblemsPage: () => <span data-testid="judge-page" />,
}));

describe("DashboardProblemsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.CONTESTANT, "contestant-page"],
    [null, "guest-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardProblemsPage />, {
        authorization: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );
});
