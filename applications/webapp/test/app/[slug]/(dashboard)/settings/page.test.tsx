import { screen } from "@testing-library/react";
import { forbidden } from "next/navigation";

import DashboardSettingsPage from "@/app/[slug]/(dashboard)/settings/page";
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
      expect(forbidden).not.toHaveBeenCalled();
    },
  );

  it("forbids guests and non-admin members", async () => {
    await renderWithProviders(<DashboardSettingsPage />, { session: null });
    expect(forbidden).toHaveBeenCalled();
  });
});
