import { render, screen } from "@testing-library/react";

import { JudgeSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/JudgeSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage", () => ({
  SubmissionsPage: (props: { submissions: unknown[]; problems: unknown[]; canViewExecutions?: boolean; canEdit?: boolean }) => (
    <div data-testid="submission-props">{`${props.submissions.length}:${props.problems.length}:${Boolean(props.canViewExecutions)}:${Boolean(props.canEdit)}`}</div>
  ),
}));

describe("JudgeSubmissionsPage", () => {
  it("passes judge submissions and enables viewing and editing", async () => {
    await renderWithProviders(<JudgeSubmissionsPage />, {
      judgeDashboard: MockJudgeDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("submission-props")).toHaveTextContent("1:1:true:true");
  });
});
