import { useDashboardReseter } from "@/app/_lib/hook/dashboard-reseter-hook";
import { MockAdminDashboardResponseDTO } from "@/test/mock/response/dashboard/MockAdminDashboardResponseDTO";
import { MockContestantDashboardResponseDTO } from "@/test/mock/response/dashboard/MockContestantDashboardResponseDTO";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/dashboard/MockGuestDashboardResponseDTO";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/dashboard/MockJudgeDashboardResponseDTO";
import { MockStaffDashboardResponseDTO } from "@/test/mock/response/dashboard/MockStaffDashboardResponseDTO";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useDashboardReseter", () => {
  it("should dispatch reset actions for all dashboard slices", async () => {
    const { result, store } = await renderHookWithProviders(
      () => useDashboardReseter(),
      {
        adminDashboard: MockAdminDashboardResponseDTO(),
        contestantDashboard: MockContestantDashboardResponseDTO(),
        judgeDashboard: MockJudgeDashboardResponseDTO(),
        guestDashboard: MockGuestDashboardResponseDTO(),
        staffDashboard: MockStaffDashboardResponseDTO(),
      },
    );

    result.current.reset();

    const state = store.getState();
    expect(state.adminDashboard).toEqual({});
    expect(state.contestantDashboard).toEqual({});
    expect(state.judgeDashboard).toEqual({});
    expect(state.guestDashboard).toEqual({});
    expect(state.staffDashboard).toEqual({});
  });
});
