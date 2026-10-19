import { screen } from "@testing-library/react";

import { SpectatorSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/SpectatorSubmissionsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockSpectatorDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

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

describe("SpectatorSubmissionsPage", () => {
  it("passes spectator submission and problem data to the shared view", async () => {
    await renderWithProviders(<SpectatorSubmissionsPage />, {
      spectatorDashboard: MockSpectatorDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("submission-props")).toHaveTextContent("1:1");
  });
});
