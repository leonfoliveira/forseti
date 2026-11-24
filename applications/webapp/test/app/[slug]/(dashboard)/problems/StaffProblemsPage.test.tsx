import { screen } from "@testing-library/react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { StaffProblemsPage } from "@/app/[slug]/(dashboard)/problems/StaffProblemsPage";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";
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
