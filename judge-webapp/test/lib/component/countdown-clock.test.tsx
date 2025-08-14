import { act, render, screen } from "@testing-library/react";

import { CountdownClock } from "@/lib/component/countdown-clock";

// Mock the FormattedDuration component
jest.mock("@/lib/component/format/formatted-duration", () => ({
  FormattedDuration: ({ ms }: { ms: number }) => (
    <span data-testid="formatted-duration">{ms}ms</span>
  ),
}));

describe("CountdownClock", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the countdown clock with correct initial value", () => {
    const futureDate = new Date("2023-01-01T01:00:00Z"); // 1 hour in the future
    render(<CountdownClock to={futureDate} />);

    const formattedDuration = screen.getByTestId("formatted-duration");
    expect(formattedDuration).toBeInTheDocument();
    expect(formattedDuration).toHaveTextContent("3600000ms"); // 1 hour in milliseconds
  });

  it("applies custom className", () => {
    const futureDate = new Date("2023-01-01T01:00:00Z");
    render(<CountdownClock to={futureDate} className="custom-class" />);

    const clockElement = screen.getByTestId("formatted-duration").parentElement;
    expect(clockElement).toHaveClass("custom-class");
  });

  it("applies error styling when time is less than 20 minutes", () => {
    const futureDate = new Date("2023-01-01T00:10:00Z"); // 10 minutes in the future
    render(<CountdownClock to={futureDate} />);

    const clockElement = screen.getByTestId("formatted-duration").parentElement;
    expect(clockElement).toHaveClass("text-error");
  });

  it("does not apply error styling when time is 20 minutes or more", () => {
    const futureDate = new Date("2023-01-01T00:20:00Z"); // 20 minutes in the future
    render(<CountdownClock to={futureDate} />);

    const clockElement = screen.getByTestId("formatted-duration").parentElement;
    expect(clockElement).not.toHaveClass("text-error");
  });

  it("combines error styling with custom className", () => {
    const futureDate = new Date("2023-01-01T00:10:00Z"); // 10 minutes in the future
    render(<CountdownClock to={futureDate} className="custom-class" />);

    const clockElement = screen.getByTestId("formatted-duration").parentElement;
    expect(clockElement).toHaveClass("text-error");
    expect(clockElement).toHaveClass("custom-class");
  });

  it("updates the countdown every second", () => {
    const futureDate = new Date("2023-01-01T00:01:00Z"); // 1 minute in the future
    render(<CountdownClock to={futureDate} />);

    const formattedDuration = screen.getByTestId("formatted-duration");
    expect(formattedDuration).toHaveTextContent("60000ms");

    // Fast-forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(formattedDuration).toHaveTextContent("59000ms");

    // Fast-forward another second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(formattedDuration).toHaveTextContent("58000ms");
  });

  it("calls onZero callback when countdown reaches zero", () => {
    const onZero = jest.fn();
    const futureDate = new Date("2023-01-01T00:00:02Z"); // 2 seconds in the future
    render(<CountdownClock to={futureDate} onZero={onZero} />);

    expect(onZero).not.toHaveBeenCalled();

    // Fast-forward to exactly when countdown should reach zero
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onZero).toHaveBeenCalledTimes(1);
  });

  it("stops updating when countdown reaches zero", () => {
    const futureDate = new Date("2023-01-01T00:00:01Z"); // 1 second in the future
    render(<CountdownClock to={futureDate} />);

    const formattedDuration = screen.getByTestId("formatted-duration");
    expect(formattedDuration).toHaveTextContent("1000ms");

    // Fast-forward to zero
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(formattedDuration).toHaveTextContent("0ms");

    // Fast-forward more time - should stay at 0
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(formattedDuration).toHaveTextContent("0ms");
  });

  it("handles past dates by showing zero", () => {
    const pastDate = new Date("2022-12-31T23:00:00Z"); // 1 hour in the past
    render(<CountdownClock to={pastDate} />);

    const formattedDuration = screen.getByTestId("formatted-duration");
    expect(formattedDuration).toHaveTextContent("0ms");
  });

  it("calls onZero immediately for past dates", () => {
    const onZero = jest.fn();
    const pastDate = new Date("2022-12-31T23:00:00Z"); // 1 hour in the past
    render(<CountdownClock to={pastDate} onZero={onZero} />);

    // The onZero callback should be called on the first interval tick
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onZero).toHaveBeenCalledTimes(1);
  });

  it("cleans up interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const futureDate = new Date("2023-01-01T01:00:00Z");
    const { unmount } = render(<CountdownClock to={futureDate} />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("resets interval when 'to' prop changes", () => {
    const setIntervalSpy = jest.spyOn(global, "setInterval");
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    const futureDate1 = new Date("2023-01-01T01:00:00Z");
    const { rerender } = render(<CountdownClock to={futureDate1} />);

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    const futureDate2 = new Date("2023-01-01T02:00:00Z");
    rerender(<CountdownClock to={futureDate2} />);

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalledTimes(2);

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it("switches from normal to error styling when crossing 20-minute threshold", () => {
    const futureDate = new Date("2023-01-01T00:21:00Z"); // 21 minutes in the future
    render(<CountdownClock to={futureDate} />);

    const clockElement = screen.getByTestId("formatted-duration").parentElement;
    expect(clockElement).not.toHaveClass("text-error");

    // Fast-forward 1 minute and 1 second to cross the 20-minute threshold
    act(() => {
      jest.advanceTimersByTime(61000);
    });

    expect(clockElement).toHaveClass("text-error");
  });
});
