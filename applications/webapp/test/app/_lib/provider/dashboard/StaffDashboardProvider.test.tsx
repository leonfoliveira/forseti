import { act, screen } from "@testing-library/react";

import { StaffDashboardProvider } from "@/app/_lib/provider/dashboard/StaffDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockContestResponseDTO,
  MockSessionResponseDTO,
  MockStaffDashboardResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("StaffDashboardProvider", () => {
  it("fetches staff dashboard data and renders children when initialized", async () => {
    (
      Composition.dashboardReader.getStaffDashboard as jest.Mock
    ).mockResolvedValue(MockStaffDashboardResponseDTO());
    await renderWithProviders(
      <StaffDashboardProvider>
        <span data-testid="child">Ready</span>
      </StaffDashboardProvider>,
      {
        contest: MockContestResponseDTO(),
        session: MockSessionResponseDTO(),
      },
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(Composition.dashboardReader.getStaffDashboard).toHaveBeenCalledWith(
      "contest-1",
    );
    expect(Composition.staffDashboardRoomListener.subscribe).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });
});
