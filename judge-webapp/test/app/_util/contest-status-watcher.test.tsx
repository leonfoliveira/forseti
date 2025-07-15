import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useContestStatusWatcher,
  useContestStatusWatcherBatch,
} from "@/app/_util/contest-status-watcher";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

jest.useFakeTimers();

describe("useContestStatusWatcherBatch", () => {
  it("should return the correct status for a contest", async () => {
    const now = new Date();
    const startAt = new Date(now.getTime() + 1000 * 60);
    const endAt = new Date(now.getTime() + 1000 * 60 * 2);
    const contest = {
      id: "contest-1",
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
    const { result } = renderHook(() =>
      useContestStatusWatcherBatch([contest]),
    );

    expect(result.current[contest.id]).toBe(ContestStatus.NOT_STARTED);
    act(() => {
      jest.advanceTimersToNextTimer();
    });
    await waitFor(() =>
      expect(result.current[contest.id]).toBe(ContestStatus.IN_PROGRESS),
    );
  });
});

describe("useContestStatusWatcher", () => {
  it("should return undefined when contest is undefined", () => {
    const { result } = renderHook(() => useContestStatusWatcher(undefined));
    expect(result.current).toBeUndefined();
  });

  it("should return the correct status for a contest", async () => {
    const now = new Date();
    const startAt = new Date(now.getTime() + 1000 * 60);
    const endAt = new Date(now.getTime() + 1000 * 60 * 2);
    const contest = {
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
    };
    const { result } = renderHook(() => useContestStatusWatcher(contest));

    expect(result.current).toBe(ContestStatus.NOT_STARTED);
    act(() => {
      jest.advanceTimersToNextTimer();
    });
    await waitFor(() => expect(result.current).toBe(ContestStatus.IN_PROGRESS));
  });
});
