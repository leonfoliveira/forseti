import { screen } from "@testing-library/react";

import { StaffSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/StaffSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("StaffSubmissionsPage", () => {
  it("passes staff submission and problem data to the shared view", async () => {
    const staffDashboard = MockStaffDashboardResponseDTO();

    await renderWithProviders(<StaffSubmissionsPage />, {
      staffDashboard,
    });

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: staffDashboard.submissions,
        problems: staffDashboard.problems,
        canDownloadAny: true,
      }),
      undefined,
    );
  });
});
