import { screen } from "@testing-library/react";

import { JudgeSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/JudgeSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("JudgeSubmissionsPage", () => {
  it("passes judge submissions and enables viewing and editing", async () => {
    const judgeDashboard = MockJudgeDashboardResponseDTO();

    await renderWithProviders(<JudgeSubmissionsPage />, {
      judgeDashboard,
    });

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: judgeDashboard.submissions,
        problems: judgeDashboard.problems,
        canDownloadAny: true,
        canViewExecutions: true,
      }),
      undefined,
    );
  });
});
