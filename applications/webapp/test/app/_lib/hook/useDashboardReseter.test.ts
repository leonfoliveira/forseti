import { act } from "@testing-library/react";

import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import {
  MockAdminDashboardResponseDTO,
  MockContestantDashboardResponseDTO,
  MockJudgeDashboardResponseDTO,
  MockSpectatorDashboardResponseDTO,
  MockStaffDashboardResponseDTO,
} from "@/test/mock/response/MockDTOs";
import { renderHookWithProviders } from "@/test/render-with-providers";

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
