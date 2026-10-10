import { screen } from "@testing-library/dom";

import DashboardAnnouncementsPage from "@/app/[slug]/(dashboard)/announcements/page";
import { MemberType } from "@/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/announcements/AdminAnnouncementsPage",
  () => ({
    AdminAnnouncementsPage: () => <span data-testid="admin-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/announcements/ContestantAnnouncementsPage",
  () => ({
    ContestantAnnouncementsPage: () => <span data-testid="contestant-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/announcements/GuestAnnouncementsPage",
  () => ({
    GuestAnnouncementsPage: () => <span data-testid="guest-page" />,
  }),
);
jest.mock(
  "@/app/[slug]/(dashboard)/announcements/JudgeAnnouncementsPage",
  () => ({
    JudgeAnnouncementsPage: () => <span data-testid="judge-page" />,
  }),
);

describe("DashboardAnnouncementsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
    [MemberType.JUDGE, "judge-page"],
    [MemberType.CONTESTANT, "contestant-page"],
    [null, "guest-page"],
  ])(
    "should render correct page for member type",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardAnnouncementsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );
});
