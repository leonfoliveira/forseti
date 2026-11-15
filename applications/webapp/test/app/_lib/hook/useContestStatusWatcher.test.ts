import { act } from "@testing-library/react";

import { useContestStatusWatcher } from "@/app/_lib/hook/useContestStatusWatcher";
import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { renderHookWithProviders } from "@/test/render-with-providers";
import { MockContestResponseDTO } from "@/test/mock/response/MockDTOs";

describe("useContestStatusWatcher hook", () => {
  it("derives status and recalculates when contest details change", async () => {
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const contest = MockContestResponseDTO({
      startAt: "2026-01-01T01:00:00Z",
      endAt: "2026-01-01T02:00:00Z",
    });
    const { result } = await renderHookWithProviders(
      () => useContestStatusWatcher(),
      { contest },
    );

    expect(result.current).toBe(ContestStatus.NOT_STARTED);

    await act(async () => jest.advanceTimersByTime(1 * 60 * 60 * 1000));
    expect(result.current).toBe(ContestStatus.IN_PROGRESS);

    await act(async () => jest.advanceTimersByTime(1 * 60 * 60 * 1000));
    expect(result.current).toBe(ContestStatus.ENDED);
  });
});
