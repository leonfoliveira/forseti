import { screen } from "@testing-library/react";

import { SpectatorProblemsPage } from "@/app/[slug]/(dashboard)/problems/SpectatorProblemsPage";
import { renderWithProviders } from "@/test/render-with-providers";
import { MockSpectatorDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

jest.mock("@/app/[slug]/(dashboard)/_common/problems/ProblemsPage", () => ({
  ProblemsPage: ({ problems }: { problems: unknown[] }) => (
    <div data-testid="problem-count">{problems.length}</div>
  ),
}));

describe("SpectatorProblemsPage", () => {
  it("passes the spectator problem list to the shared view", async () => {
    await renderWithProviders(<SpectatorProblemsPage />, {
      spectatorDashboard: MockSpectatorDashboardResponseDTO() as never,
    });
    expect(screen.getByTestId("problem-count")).toHaveTextContent("1");
  });
});
