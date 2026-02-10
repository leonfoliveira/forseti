import { act } from "react";

import { useContestStatusWatcher } from "@/app/_lib/util/contest-status-watcher";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { MockContestMetadataResponseDTO } from "@/test/mock/response/contest/MockContestMetadataResponseDTO";
import { renderHookWithProviders } from "@/test/render-with-providers";

describe("useContestStatusWatcher", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date("2025-01-01T09:00:00Z"));
  });

  it("should return the correct status when contest has not started yet", async () => {
    const { result } = await renderHookWithProviders(
      () => useContestStatusWatcher(),
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: "2025-01-01T10:00:00Z", // 1 hour from mock time
          endAt: "2025-01-01T15:00:00Z", // 6 hours from mock time
        }),
      },
    );

    expect(result.current).toBe(ContestStatus.NOT_STARTED);
  });

  it("should return correct status when contest has started", async () => {
    const { result } = await renderHookWithProviders(
      () => useContestStatusWatcher(),
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: "2025-01-01T10:00:00Z", // 1 hour from mock time
          endAt: "2025-01-01T15:00:00Z", // 6 hours from mock time
        }),
      },
    );

    expect(result.current).toBe(ContestStatus.NOT_STARTED);
    await act(async () => {
      jest.setSystemTime(new Date("2025-01-01T10:00:00Z")); // update system time first
      jest.advanceTimersByTime(60 * 60 * 1000); // advance 1 hour to contest start
    });
    expect(result.current).toBe(ContestStatus.IN_PROGRESS);
  });

  it("should return correct status when contest has ended", async () => {
    const { result } = await renderHookWithProviders(
      () => useContestStatusWatcher(),
      {
        contestMetadata: MockContestMetadataResponseDTO({
          startAt: "2025-01-01T10:00:00Z", // 1 hour from mock time
          endAt: "2025-01-01T15:00:00Z", // 6 hours from mock time
        }),
      },
    );

    expect(result.current).toBe(ContestStatus.NOT_STARTED);
    await act(async () => {
      jest.advanceTimersByTime(60 * 60 * 1000); // advance 1 hour to contest start
      jest.setSystemTime(new Date("2025-01-01T10:00:00Z")); // update system time
    });
    expect(result.current).toBe(ContestStatus.IN_PROGRESS);
    await act(async () => {
      jest.setSystemTime(new Date("2025-01-01T15:00:00Z")); // update system time first
      jest.advanceTimersByTime(5 * 60 * 60 * 1000); // advance 5 hours to contest end
    });
    expect(result.current).toBe(ContestStatus.ENDED);
  });
});
