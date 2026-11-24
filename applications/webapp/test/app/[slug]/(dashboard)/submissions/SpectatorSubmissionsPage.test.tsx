import { screen } from "@testing-library/react";

import { SubmissionsPage } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage";
import { SpectatorSubmissionsPage } from "@/app/[slug]/(dashboard)/submissions/SpectatorSubmissionsPage";
import { MockSpectatorDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock(
  "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPage",
  () => ({
    SubmissionsPage: jest.fn(),
  }),
);

describe("SpectatorSubmissionsPage", () => {
  it("passes spectator submission and problem data to the shared view", async () => {
    const spectatorDashboard = MockSpectatorDashboardResponseDTO();

    await renderWithProviders(<SpectatorSubmissionsPage />, {
      spectatorDashboard,
    });

    expect(SubmissionsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        submissions: spectatorDashboard.submissions,
        problems: spectatorDashboard.problems,
      }),
      undefined,
    );
  });
});
