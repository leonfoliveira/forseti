import { act, screen, waitFor } from "@testing-library/react";

import { CountdownClock } from "@/app/_lib/component/display/countdown-clock";
import { renderWithProviders } from "@/test/render-with-providers";

describe("CountdownClock", () => {
  it("should render the countdown correctly", async () => {
    const futureDate = new Date(Date.now() + 60000); // 1 minute from now

    await renderWithProviders(<CountdownClock to={futureDate} />);

    const clock = screen.getByTestId("clock");
    await waitFor(() => {
      expect(clock).toBeInTheDocument();
      expect(clock).toHaveTextContent("00:01:00");
    });
  });

  it("should update countdown every second", async () => {
    const futureDate = new Date(Date.now() + 60000); // 1 minute from now

    await renderWithProviders(<CountdownClock to={futureDate} />);

    const clock = screen.getByTestId("clock");
    await waitFor(() => {
      expect(clock).toHaveTextContent("00:01:00");
    });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(clock).toHaveTextContent("00:00:59");
    });
  });

  it("should stop countdown and show 0 when time reaches zero", async () => {
    const futureDate = new Date(Date.now() + 1000); // 1 second from now

    await renderWithProviders(<CountdownClock to={futureDate} />);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    const clock = screen.getByTestId("clock");
    await waitFor(() => {
      expect(clock).toHaveTextContent("00:00:00");
    });
  });

  it("should apply error styling when less than 20 minutes remaining", async () => {
    const futureDate = new Date(Date.now() + 20 * 60 * 1000);

    await renderWithProviders(<CountdownClock to={futureDate} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const clock = screen.getByTestId("clock");
    await waitFor(() => {
      expect(clock).toHaveClass("text-destructive");
      expect(clock).toHaveTextContent("00:19:59");
    });
  });

  it("should not apply error styling when more than 20 minutes remaining", async () => {
    const futureDate = new Date(Date.now() + 20 * 60 * 1000 + 1000);

    await renderWithProviders(<CountdownClock to={futureDate} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    const clock = screen.getByTestId("clock");
    await waitFor(() => {
      expect(clock).not.toHaveClass("text-destructive");
      expect(clock).toHaveTextContent("00:20:00");
    });
  });

  it("should handle past dates gracefully", async () => {
    const pastDate = new Date(Date.now() - 5000);
    const onZero = jest.fn();

    await renderWithProviders(<CountdownClock to={pastDate} onZero={onZero} />);

    const clock = screen.getByTestId("clock");
    await waitFor(() => {
      expect(onZero).not.toHaveBeenCalled();
      expect(clock).toHaveTextContent("00:00:00");
    });
  });

  it("should clean up interval on unmount", async () => {
    const futureDate = new Date(Date.now() + 60000);
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");

    const { unmount } = await renderWithProviders(
      <CountdownClock to={futureDate} />,
    );

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });
});
