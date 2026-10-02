import { act, fireEvent, render, screen } from "@testing-library/react";

import { ColorPicker } from "@/app/_lib/component/form/ColorPicker";

describe("ColorPicker", () => {
  it("debounces changes and cancels a pending callback when unmounted", async () => {
    const onChange = jest.fn();
    const { unmount } = render(<ColorPicker onChange={onChange} />);
    fireEvent.change(screen.getByTestId("color-input"), { target: { value: "#abcdef" } });
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(50));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: "#abcdef" }),
    }));
    fireEvent.change(screen.getByTestId("color-input"), { target: { value: "#ffffff" } });
    unmount();
    await act(async () => jest.advanceTimersByTime(50));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
