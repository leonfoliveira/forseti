import { act, screen } from "@testing-library/react";

import { ContestantDashboardProvider } from "@/app/_lib/provider/dashboard/ContestantDashboardProvider";
import { Composition } from "@/config/composition";
import {
  MockContestantDashboardResponseDTO,
  MockContestResponseDTO,
  MockSessionResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ContestantDashboardProvider", () => {
  it("fetches contestant dashboard data and renders children when initialized", async () => {
    const dashboard = MockContestantDashboardResponseDTO();
    (
      Composition.dashboardReader.getContestantDashboard as jest.Mock
    ).mockResolvedValue(dashboard);
    await renderWithProviders(
      <ContestantDashboardProvider>
        <span data-testid="child">Ready</span>
      </ContestantDashboardProvider>,
      {
        contest: dashboard.contest,
        session: MockSessionResponseDTO(),
      },
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      Composition.dashboardReader.getContestantDashboard,
    ).toHaveBeenCalledWith(dashboard.contest.id);
    expect(
      Composition.contestantDashboardRoomListener.subscribe,
    ).toHaveBeenCalled();
    expect(screen.getByTestId("child")).toHaveTextContent("Ready");
  });
});
