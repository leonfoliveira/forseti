import { screen } from "@testing-library/react";

import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";
import { JudgeProblemsPage } from "@/app/[slug]/(dashboard)/problems/JudgeProblemsPage";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: jest.fn(),
}));

describe("JudgeProblemsPage", () => {
  it("passes judge problems and allows test-case downloads", async () => {
    const judgeDashboard = MockJudgeDashboardResponseDTO();

    await renderWithProviders(<JudgeProblemsPage />, {
      judgeDashboard,
    });

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems: judgeDashboard.problems,
        canDownloadTestCases: true,
      }),
      undefined,
    );
  });
});
