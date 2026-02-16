import { render, screen, waitFor, act } from "@testing-library/react";

import { Balloon } from "@/app/_lib/component/display/balloon";

// Mock window dimensions
const mockWindowHeight = 1000;

beforeEach(() => {
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: mockWindowHeight,
  });

  // Mock addEventListener and removeEventListener
  jest.spyOn(window, "addEventListener");
  jest.spyOn(window, "removeEventListener");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
});

describe("Balloon Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should render balloon with correct color", () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#ff0000" onTopReached={onTopReached} />);

    const balloon = screen.getByTestId("balloon");
    expect(balloon).toBeInTheDocument();
    expect(balloon).toHaveStyle({
      fill: "#ff0000",
      stroke: "#ff0000",
    });
  });

  it("should start animation after a small delay", async () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#00ff00" onTopReached={onTopReached} />);

    const balloon = screen.getByTestId("balloon");

    // Initially should not be animating (no transition)
    expect(balloon).toHaveStyle({ transition: "none" });

    // Advance timers to trigger animation
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(balloon).toHaveStyle({
        transition:
          "bottom 3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 3s ease-in-out",
        bottom: `${mockWindowHeight + 100}px`,
      });
    });
  });

  it("should handle screen resize events", async () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#0000ff" onTopReached={onTopReached} />);

    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );

    // Simulate screen resize
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1200,
    });

    // Get the resize handler and call it
    const resizeHandler = (
      window.addEventListener as jest.Mock
    ).mock.calls.find(([event]) => event === "resize")?.[1];

    if (resizeHandler) {
      resizeHandler();
    }

    // Advance timer to start animation
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    const balloon = screen.getByTestId("balloon");
    await waitFor(() => {
      expect(balloon).toHaveStyle({ bottom: "1300px" }); // 1200 + 100
    });
  });

  it("should call onTopReached when animation ends", async () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#ff00ff" onTopReached={onTopReached} />);

    const balloon = screen.getByTestId("balloon");

    // Start animation
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(balloon).toHaveStyle({
        transition:
          "bottom 3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 3s ease-in-out",
      });
    });

    // Simulate transition end event
    const transitionEndEvent = new Event("transitionend");
    balloon.dispatchEvent(transitionEndEvent);

    expect(onTopReached).toHaveBeenCalledTimes(1);
  });

  it("should start from below screen and moves up", async () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#ffff00" onTopReached={onTopReached} />);

    const balloon = screen.getByTestId("balloon");

    // Initially should be below screen
    expect(balloon).toHaveStyle({ bottom: "-100px" });

    // After animation starts, should move above screen
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(balloon).toHaveStyle({ bottom: `${mockWindowHeight + 100}px` });
    });
  });

  it("should have fun animation properties", async () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#00ffff" onTopReached={onTopReached} />);

    const balloon = screen.getByTestId("balloon");

    // Start animation
    await act(async () => {
      jest.advanceTimersByTime(150);
    });

    await waitFor(() => {
      expect(balloon).toHaveStyle({
        transform: "translateX(-10px) rotate(5deg)",
        animation: "balloon-sway 3s ease-in-out",
      });
    });
  });

  it("should clean up event listeners on unmount", () => {
    const onTopReached = jest.fn();
    const { unmount } = render(
      <Balloon color="#ffffff" onTopReached={onTopReached} />,
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function),
    );
  });

  it("should be positioned correctly and have proper classes", () => {
    const onTopReached = jest.fn();
    render(<Balloon color="#000000" onTopReached={onTopReached} />);

    const balloon = screen.getByTestId("balloon");

    expect(balloon).toHaveClass(
      "absolute",
      "right-4",
      "pointer-events-none",
      "z-50",
    );
  });
});
