import { render, screen, fireEvent } from "@testing-library/react";
import { Alert } from "@/app/_component/alert/alert";
import { AlertLevel } from "@/app/_component/alert/alert-provider";

jest.useFakeTimers();

it("renders the alert with the correct text and icon based on the alert level", () => {
  render(
    <Alert
      alert={{
        id: "",
        level: AlertLevel.SUCCESS,
        text: "Success message",
        ttl: 5000,
      }}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByTestId("alert")).toHaveClass("alert-success");
});

it("calls onClose when the alert is clicked", () => {
  const onCloseMock = jest.fn();
  render(
    <Alert
      alert={{
        id: "",
        level: AlertLevel.INFO,
        text: "Info message",
        ttl: 5000,
      }}
      onClose={onCloseMock}
    />,
  );
  fireEvent.click(screen.getByTestId("alert"));
  expect(onCloseMock).toHaveBeenCalled();
});

it("automatically calls onClose after the specified ttl", () => {
  const onCloseMock = jest.fn();
  render(
    <Alert
      alert={{
        id: "",
        level: AlertLevel.WARNING,
        text: "Warning message",
        ttl: 3000,
      }}
      onClose={onCloseMock}
    />,
  );
  jest.advanceTimersByTime(3000);
  expect(onCloseMock).toHaveBeenCalled();
});

it("clears the timeout when the component is unmounted", () => {
  const onCloseMock = jest.fn();
  const { unmount } = render(
    <Alert
      alert={{
        id: "",
        level: AlertLevel.ERROR,
        text: "Error message",
        ttl: 3000,
      }}
      onClose={onCloseMock}
    />,
  );
  unmount();
  jest.advanceTimersByTime(3000);
  expect(onCloseMock).not.toHaveBeenCalled();
});
