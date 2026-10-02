import { render, screen } from "@testing-library/react";

import { AdminProblemsPage } from "@/app/[slug]/(dashboard)/problems/AdminProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: ({ problems, canDownloadTestCases }: { problems: unknown[]; canDownloadTestCases?: boolean }) => (
    <div data-testid="problem-props">{`${problems.length}:${Boolean(canDownloadTestCases)}`}</div>
  ),
}));

describe("AdminProblemsPage", () => {
  it("passes the admin problem list and allows test-case downloads", async () => {
    await renderWithProviders(<AdminProblemsPage />, {
      adminDashboard: MockAdminDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("problem-props")).toHaveTextContent("1:true");
  });
});
