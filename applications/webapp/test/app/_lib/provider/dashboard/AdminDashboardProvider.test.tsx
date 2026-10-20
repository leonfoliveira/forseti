import { act, screen } from "@testing-library/react";

import { AdminDashboardProvider } from "@/app/_lib/provider/dashboard/AdminDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockAdminDashboardResponseDTO,
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("AdminDashboardProvider", () => {
  it("fetches contest dashboard data and renders children when initialized", async () => {
    const dashboard = MockAdminDashboardResponseDTO();
    (
      Composition.dashboardReader.getAdminDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
    await renderWithProviders(
      <AdminDashboardProvider>
        <span data-testid="child">Ready</span>
      </AdminDashboardProvider>,
      {
        contest: dashboard.contest,
        session: MockSessionResponseDTO(),
      },
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(Composition.dashboardReader.getAdminDashboard).toHaveBeenCalledWith(
      dashboard.contest.id,
    );
    expect(Composition.adminDashboardRoomListener.subscribe).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });
});
