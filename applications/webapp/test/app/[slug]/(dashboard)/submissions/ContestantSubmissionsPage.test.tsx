import { screen } from "@testing-library/react";

import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/ContestantSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("ContestantSubmissionsPage", () => {
  it("passes member submissions and enables submission creation", async () => {
    const contestantDashboard = MockContestantDashboardResponseDTO();

    await renderWithProviders(<ContestantSubmissionsPage />, {
      contestantDashboard,
    });

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: contestantDashboard.submissions,
        problems: contestantDashboard.problems,
        memberSubmissions: contestantDashboard.memberSubmissions,
      }),
      undefined,
    );
  });
});
