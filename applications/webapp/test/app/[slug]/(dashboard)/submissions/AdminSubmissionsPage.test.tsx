import { render, screen } from "@testing-library/react";

import { AdminSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/AdminSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage", () => ({
  SubmissionsPage: (props: { submissions: unknown[]; problems: unknown[]; canViewExecutions?: boolean; canEdit?: boolean }) => (
    <div data-testid="submission-props">{`${props.submissions.length}:${props.problems.length}:${Boolean(props.canViewExecutions)}:${Boolean(props.canEdit)}`}</div>
  ),
}));

describe("AdminSubmissionsPage", () => {
  it("passes admin submission data and enables viewing and editing", async () => {
    await renderWithProviders(<AdminSubmissionsPage />, {
      adminDashboard: MockAdminDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("submission-props")).toHaveTextContent("1:1:true:true");
  });
});
