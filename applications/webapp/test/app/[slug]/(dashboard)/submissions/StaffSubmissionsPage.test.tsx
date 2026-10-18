import { screen } from "@testing-library/react";

import { StaffSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/StaffSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: (props: {
      submissions: unknown[];
      problems: unknown[];
    }) => (
      <div data-testid="submission-props">{`${props.submissions.length}:${props.problems.length}`}</div>
    ),
  }),
);

describe("StaffSubmissionsPage", () => {
  it("passes guest submission and problem data to the shared view", async () => {
    await renderWithProviders(<StaffSubmissionsPage />, {
      staffDashboard: MockStaffDashboardResponseDTO(),
    });
    expect(screen.getByTestId("submission-props")).toHaveTextContent("1:1");
  });
});
