import { screen } from "@testing-library/dom";
import { forbidden } from "next/navigation";

import DashboardSettingsPage from "@/app/[slug]/(dashboard)/settings/page";
import { MemberType } from "@/core/domain/enumerate/MemberType";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/settings/admin-settings-page", () => ({
  AdminSettingsPage: () => <span data-testid="admin-page" />,
}));

describe("DashboardSettingsPage", () => {
  it.each([[MemberType.CONTESTANT], [MemberType.JUDGE], [null]])(
    "should throw forbidden when user is not allowed",
    async (memberType) => {
      await renderWithProviders(<DashboardSettingsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(forbidden).toHaveBeenCalled();
    },
  );

  it.each([[MemberType.ROOT], [MemberType.ADMIN]])(
    "should render correctly",
    async (memberType) => {
      await renderWithProviders(<DashboardSettingsPage />, {
        session: { member: { type: memberType } },
      } as any);

      expect(screen.getByTestId("admin-page")).toBeInTheDocument();
    },
  );
});
