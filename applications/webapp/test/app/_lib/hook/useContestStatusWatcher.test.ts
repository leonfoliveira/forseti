import { act, waitFor } from "@testing-library/react";

import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { renderHookWithProviders } from "@/test/render-with-providers";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

describe("useContestStatusWatcher hook", () => {
  it("derives status and recalculates when contest details change", async () => {
    jest.setSystemTime(new Date("2026-01-01T01:00:00Z"));
    const contest = MockContestResponseDTO();
    const { result, store } = await renderHookWithProviders(() => useContestStatusWatcher(), { contest });
    expect(result.current).toBe(ContestStatus.IN_PROGRESS);
    await act(async () => store.dispatch({
      type: "contest/set",
      payload: { ...contest, startAt: "2026-01-01T02:00:00Z" },
    }));
    await waitFor(() => expect(result.current).toBe(ContestStatus.NOT_STARTED));
  });
});
