import { fireEvent, screen } from "@testing-library/dom";

import { ColorPicker } from "@/app/_lib/component/form/color-picker";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ColorPicker", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should debounce multiple color changes", async () => {
    const onChange = jest.fn();
    await renderWithProviders(<ColorPicker onChange={onChange} />);

    const colorInput = screen.getByTestId("color-input");

    // Trigger multiple changes rapidly
    fireEvent.change(colorInput, { target: { value: "#ff0000" } });
    fireEvent.change(colorInput, { target: { value: "#00ff00" } });
    fireEvent.change(colorInput, { target: { value: "#0000ff" } });

    // Should not have been called yet
    expect(onChange).not.toHaveBeenCalled();

    // Advance timers to trigger the debounced onChange
    jest.advanceTimersByTime(50);

    // Should only be called once with the last value
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: "#0000ff" }),
      }),
    );
  });
});
