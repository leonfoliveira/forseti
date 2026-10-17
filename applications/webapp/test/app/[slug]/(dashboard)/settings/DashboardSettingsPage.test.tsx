import { screen } from "@testing-library/react";

import { DashboardSettingsPage } from "@/app/[slug]/(dashboard)/settings/DashboardSettingsPage";
import { MemberType } from "@/domain/enumerate/MemberType";
import { MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/settings/AdminSettingsPage", () => ({
  AdminSettingsPage: () => <div data-testid="admin-settings">Settings</div>,
}));

describe("DashboardSettingsPage", () => {
  it.each([MemberType.ROOT, MemberType.ADMIN])(
    "allows %s to view settings",
    async (type) => {
      await renderWithProviders(<DashboardSettingsPage />, {
        session: MockSessionResponseDTO({
          member: { id: "member-1", name: "Admin", type },
        }),
      });
      expect(screen.getByTestId("admin-settings")).toBeInTheDocument();
    },
  );
});
