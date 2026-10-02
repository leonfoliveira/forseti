import { act, screen } from "@testing-library/react";

import { GuestDashboardProvider } from "@/app/_lib/provider/dashboard/GuestDashboardProvider";
import { Composition } from "@/config/composition";
import { MockGuestDashboardResponseDTO, MockContestResponseDTO } from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("GuestDashboardProvider", () => {
  it("fetches guest dashboard data and renders children when initialized", async () => {
    (Composition.dashboardReader.getGuestDashboard as jest.Mock).mockResolvedValue(MockGuestDashboardResponseDTO());
    await renderWithProviders(<GuestDashboardProvider><span data-testid="child">Ready</span></GuestDashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: null,
    });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(Composition.dashboardReader.getGuestDashboard).toHaveBeenCalledWith("contest-1");
    expect(Composition.webSocketClient.join).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });

  it("renders the error view when fetching fails", async () => {
    (Composition.dashboardReader.getGuestDashboard as jest.Mock).mockRejectedValue(new Error("network"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    await renderWithProviders(<GuestDashboardProvider><span>Guest</span></GuestDashboardProvider>, {
      contest: MockContestResponseDTO(),
      session: null,
    });
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByTestId("code")).toHaveTextContent("500");
  });
});
