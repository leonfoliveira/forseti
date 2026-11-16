import { act } from "@testing-library/react";

import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import { renderHookWithProviders } from "@/test/render-with-providers";
import {
  MockAdminDashboardResponseDTO,
  MockContestantDashboardResponseDTO,
  MockSpectatorDashboardResponseDTO,
  MockJudgeDashboardResponseDTO,
  MockStaffDashboardResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("useDashboardReseter hook", () => {
  it("resets all role dashboard slices", async () => {
    const { result, store } = await renderHookWithProviders(
      () => useDashboardReseter(),
      {
        adminDashboard: MockAdminDashboardResponseDTO(),
        contestantDashboard: MockContestantDashboardResponseDTO(),
        spectatorDashboard: MockSpectatorDashboardResponseDTO(),
        judgeDashboard: MockJudgeDashboardResponseDTO(),
        staffDashboard: MockStaffDashboardResponseDTO(),
      },
    );
    await act(async () => result.current.reset());
    expect(store.getState()).toMatchObject({
      adminDashboard: {},
      contestantDashboard: {},
      spectatorDashboard: {},
      judgeDashboard: {},
      staffDashboard: {},
    });
  });
});
