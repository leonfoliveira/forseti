import { renderHook } from "@testing-library/react";
import { act } from "react";

import { useWaitClock } from "@/app/contests/[slug]/_util/wait-clock-hook";

describe("useWaitClock", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it("should update the clock every second", () => {
    const target = new Date(Date.now() + 10000);
    const { result } = renderHook(() => useWaitClock(target));

    result.current.current = document.createElement("span");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.current?.textContent).toBe(
      "app.contests.[slug]._util.wait-clock-hook.duration",
    );
  });

  it("should call onZero when the countdown reaches zero", () => {
    const onZero = jest.fn();
    const target = new Date(Date.now() + 1000);
    const { result } = renderHook(() => useWaitClock(target, onZero));

    result.current.current = document.createElement("span");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onZero).toHaveBeenCalled();
  });

  it("should add text-error class when remaining time is less than 20 minutes", () => {
    const target = new Date(Date.now() + 19 * 60 * 1000);
    const { result } = renderHook(() => useWaitClock(target));

    result.current.current = document.createElement("span");

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.current?.classList.contains("text-error")).toBe(true);
  });

  it("should clear interval on unmount", () => {
    const target = new Date(Date.now() + 10000);
    const { unmount } = renderHook(() => useWaitClock(target));
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
