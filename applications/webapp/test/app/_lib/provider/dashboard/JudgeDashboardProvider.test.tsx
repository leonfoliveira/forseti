import { act, screen } from "@testing-library/react";

import { JudgeDashboardProvider } from "@/app/_lib/provider/dashboard/JudgeDashboardProvider";
import { Composition } from "@/config/composition";
import { MockJudgeDashboardResponseDTO, MockContestResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("JudgeDashboardProvider", () => {
  it("fetches judge dashboard data and renders children when initialized", async () => {
    (Composition.dashboardReader.getJudgeDashboard as jest.Mock).mockResolvedValue(MockJudgeDashboardResponseDTO());
    await renderWithProviders(<JudgeDashboardProvider><span data-testid="child">Ready</span></JudgeDashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: MockSessionResponseDTO(),
    });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(Composition.dashboardReader.getJudgeDashboard).toHaveBeenCalledWith("contest-1");
    expect(Composition.webSocketClient.join).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });
});
