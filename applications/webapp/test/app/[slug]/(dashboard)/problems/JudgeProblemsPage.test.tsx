import { render, screen } from "@testing-library/react";

import { JudgeProblemsPage } from "@/app/[slug]/(dashboard)/problems/JudgeProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: ({ problems, canDownloadTestCases }: { problems: unknown[]; canDownloadTestCases?: boolean }) => (
    <div data-testid="problem-props">{`${problems.length}:${Boolean(canDownloadTestCases)}`}</div>
  ),
}));

describe("JudgeProblemsPage", () => {
  it("passes judge problems and allows test-case downloads", async () => {
    await renderWithProviders(<JudgeProblemsPage />, {
      judgeDashboard: MockJudgeDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("problem-props")).toHaveTextContent("1:true");
  });
});
