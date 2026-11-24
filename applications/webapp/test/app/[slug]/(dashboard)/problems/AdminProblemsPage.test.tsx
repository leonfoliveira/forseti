import { screen } from "@testing-library/react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { AdminProblemsPage } from "@/app/[slug]/(dashboard)/problems/AdminProblemsPage";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: jest.fn(),
}));

describe("AdminProblemsPage", () => {
  it("passes the admin problem list and allows test-case downloads", async () => {
    const adminDashboard = MockAdminDashboardResponseDTO();

    await renderWithProviders(<AdminProblemsPage />, {
      adminDashboard,
    });

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems: adminDashboard.problems,
        canDownloadTestCases: true,
      }),
      undefined,
    );
  });
});
