import { screen } from "@testing-library/react";

import { SpectatorProblemsPage } from "@/app/[slug]/(dashboard)/problems/SpectatorProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockSpectatorDashboardResponseDTO } from "@/test/mock/response/MockDTOs";
import { ProblemsPage } from "@/app/[slug]/(dashboard)/_common/problems/ProblemsPage";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: jest.fn(),
}));

describe("SpectatorProblemsPage", () => {
  it("passes the spectator problem list to the shared view", async () => {
    const spectatorDashboard = MockSpectatorDashboardResponseDTO();

    await renderWithProviders(<SpectatorProblemsPage />, {
      spectatorDashboard,
    });

    expect(ProblemsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        problems: spectatorDashboard.problems,
      }),
      undefined,
    );
  });
});
