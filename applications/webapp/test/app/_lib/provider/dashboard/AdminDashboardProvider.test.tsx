import { act, screen } from "@testing-library/react";

import { AdminDashboardProvider } from "@/app/_lib/provider/dashboard/AdminDashboardProvider";
import { Composition } from "@/config/composition";
import { MockAdminDashboardResponseDTO, MockContestResponseDTO, MockSessionResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AdminDashboardProvider", () => {
  it("fetches contest dashboard data and renders children when initialized", async () => {
    (Composition.dashboardReader.getAdminDashboard as jest.Mock).mockResolvedValue(MockAdminDashboardResponseDTO());
    await renderWithProviders(<AdminDashboardProvider><span data-testid="child">Ready</span></AdminDashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: MockSessionResponseDTO(),
    });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(Composition.dashboardReader.getAdminDashboard).toHaveBeenCalledWith("contest-1");
    expect(Composition.webSocketClient.join).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });
});
