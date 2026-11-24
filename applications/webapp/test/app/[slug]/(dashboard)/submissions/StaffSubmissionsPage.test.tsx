import { screen } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { StaffSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/StaffSubmissionsPage";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

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
