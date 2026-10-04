import { screen } from "@testing-library/react";

import { ContestantSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/ContestantSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: (props: {
      submissions: unknown[];
      problems: unknown[];
      memberSubmissions?: unknown[];
      canCreate?: boolean;
    }) => (
      <div data-testid="submission-props">{`${props.submissions.length}:${props.memberSubmissions?.length}:${props.problems.length}:${Boolean(props.canCreate)}`}</div>
    ),
  }),
);

describe("ContestantSubmissionsPage", () => {
  it("passes member submissions and enables submission creation", async () => {
    await renderWithProviders(<ContestantSubmissionsPage />, {
      contestantDashboard: MockContestantDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("submission-props")).toHaveTextContent(
      "1:1:1:true",
    );
  });
});
