import { act, fireEvent, render, screen } from "@testing-library/react";

import { Balloon } from "@/app/_lib/component/display/Balloon";

describe("Balloon", () => {
  it("animates and notifies when the transition reaches the top", async () => {
    const onTopReached = jest.fn();
    const { unmount } = render(<Balloon color="#123456" onTopReached={onTopReached} />);
    const balloon = screen.getByTestId("balloon");
    expect(balloon).toHaveStyle({ fill: "#123456" });
    await act(async () => jest.advanceTimersByTime(100));
    expect(balloon.style.bottom).toBe(`${window.innerHeight + 100}px`);
    fireEvent.transitionEnd(balloon);
    expect(onTopReached).toHaveBeenCalledTimes(1);
    unmount();
  });
});
