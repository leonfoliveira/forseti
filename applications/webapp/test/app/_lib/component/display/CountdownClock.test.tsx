import { act, render, screen } from "@testing-library/react";

import { CountdownClock } from "@/app/_lib/component/display/CountdownClock";

describe("CountdownClock", () => {
  it("renders remaining duration and clears the interval when unmounted", async () => {
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const clearInterval = jest.spyOn(global, "clearInterval");
    const { unmount } = render(<CountdownClock to={new Date("2026-01-01T00:01:02Z")} />);
    expect(await screen.findByTestId("clock")).toHaveTextContent("00:01:02");
    await act(async () => jest.advanceTimersByTime(1000));
    expect(screen.getByTestId("clock")).toHaveTextContent("00:01:01");
    unmount();
    expect(clearInterval).toHaveBeenCalled();
  });
});
