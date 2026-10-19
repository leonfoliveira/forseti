import { act, screen } from "@testing-library/react";

import { SpectatorDashboardProvider } from "@/app/_lib/provider/dashboard/SpectatorDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockSpectatorDashboardResponseDTO,
  MockContestResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SpectatorDashboardProvider", () => {
  it("fetches spectator dashboard data and renders children when initialized", async () => {
    (
      Composition.dashboardReader.getSpectatorDashboard as jest.Mock
    ).mockResolvedValue(MockSpectatorDashboardResponseDTO());
    await renderWithProviders(
      <SpectatorDashboardProvider>
        <span data-testid="child">Ready</span>
      </SpectatorDashboardProvider>,
      {
        contest: MockContestResponseDTO(),
        session: null,
      },
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      Composition.dashboardReader.getSpectatorDashboard,
    ).toHaveBeenCalledWith("contest-1");
    expect(
      Composition.spectatorDashboardRoomListener.subscribe,
    ).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });

  it("renders the error view when fetching fails", async () => {
    (
      Composition.dashboardReader.getSpectatorDashboard as jest.Mock
    ).mockRejectedValue(new Error("network"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    await renderWithProviders(
      <SpectatorDashboardProvider>
        <span>Spectator</span>
      </SpectatorDashboardProvider>,
      {
        contest: MockContestResponseDTO(),
        session: null,
      },
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByTestId("code")).toHaveTextContent("500");
  });
});
