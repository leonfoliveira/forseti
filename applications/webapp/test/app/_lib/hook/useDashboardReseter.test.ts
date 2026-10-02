import { act } from "@testing-library/react";

import { useDashboardReseter } from "@/app/_lib/hook/useDashboardReseter";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useDashboardReseter hook", () => {
  it("resets all role dashboard slices", async () => {
    const { result, store } = await renderHookWithProviders(() => useDashboardReseter(), {
      adminDashboard: { stale: true } as never,
      contestantDashboard: { stale: true } as never,
      guestDashboard: { stale: true } as never,
      judgeDashboard: { stale: true } as never,
    });
    await act(async () => result.current.reset());
    expect(store.getState()).toMatchObject({
      adminDashboard: {},
      contestantDashboard: {},
      guestDashboard: {},
      judgeDashboard: {},
    });
  });
});
