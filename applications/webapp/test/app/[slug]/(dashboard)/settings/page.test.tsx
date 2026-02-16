import { screen } from "@testing-library/dom";
import { forbidden } from "next/navigation";

import DashboardSettingsPage from "@/app/[slug]/(dashboard)/settings/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/settings/admin-settings-page", () => ({
  AdminSettingsPage: () => <span data-testid="admin-page" />,
}));

describe("DashboardSettingsPage", () => {
  it.each([
    [MemberType.ROOT, "admin-page"],
    [MemberType.ADMIN, "admin-page"],
  ])(
    "should render correct page for member type %s",
    async (memberType, expectedTestId) => {
      await renderWithProviders(<DashboardSettingsPage />, {
        session: { member: { type: memberType } },
      } as any);
      expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
    },
  );

  it.each([MemberType.JUDGE, MemberType.CONTESTANT, null])(
    "should vall forbidden for member type %s",
    async (memberType) => {
      await renderWithProviders(<DashboardSettingsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(forbidden).toHaveBeenCalled();
    },
  );
});
