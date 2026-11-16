import { screen } from "@testing-library/react";

import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/StaffProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: jest.fn(),
}));

describe("StaffProblemsPage", () => {
  it("passes the staff problem list to the shared view", async () => {
    const staffDashboard = MockStaffDashboardResponseDTO();

    await renderWithProviders(<StaffProblemsPage />, {
      staffDashboard,
    });

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems: staffDashboard.problems,
      }),
      undefined,
    );
  });
});
