import { screen } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/AdminSubmissionsPage";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("AdminSubmissionsPage", () => {
  it("passes admin submission data and enables viewing and editing", async () => {
    const adminDashboard = MockAdminDashboardResponseDTO();

    await renderWithProviders(<AdminSubmissionsPage />, {
      adminDashboard,
    });

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: adminDashboard.submissions,
        problems: adminDashboard.problems,
        canDownloadAny: true,
        canViewExecutions: true,
      }),
      undefined,
    );
  });
});
