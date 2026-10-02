import { act, screen } from "@testing-library/react";

import { ContestantDashboardProvider } from "@/app/_lib/provider/dashboard/ContestantDashboardProvider";
import { Composition } from "@/config/composition";
import { MockContestantDashboardResponseDTO, MockContestResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ContestantDashboardProvider", () => {
  it("fetches contestant dashboard data and renders children when initialized", async () => {
    (Composition.dashboardReader.getContestantDashboard as jest.Mock).mockResolvedValue(MockContestantDashboardResponseDTO());
    await renderWithProviders(<ContestantDashboardProvider><span data-testid="child">Ready</span></ContestantDashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: MockSessionResponseDTO(),
    });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(Composition.dashboardReader.getContestantDashboard).toHaveBeenCalledWith("contest-1");
    expect(Composition.webSocketClient.join).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });
});
