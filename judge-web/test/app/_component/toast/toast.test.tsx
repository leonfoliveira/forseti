import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "@/app/_component/toast/toast";
import { ToastLevel } from "@/app/_component/toast/toast-provider";

jest.useFakeTimers();

it("renders the toast with the correct text and icon based on the toast level", () => {
  render(
    <Toast
      toast={{
        id: "",
        level: ToastLevel.SUCCESS,
        text: "Success message",
        ttl: 5000,
      }}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByTestId("toast")).toHaveClass("alert-success");
});

it("calls onClose when the toast is clicked", () => {
  const onCloseMock = jest.fn();
  render(
    <Toast
      toast={{
        id: "",
        level: ToastLevel.INFO,
        text: "Info message",
        ttl: 5000,
      }}
      onClose={onCloseMock}
    />,
  );
  fireEvent.click(screen.getByTestId("toast"));
  expect(onCloseMock).toHaveBeenCalled();
});

it("automatically calls onClose after the specified ttl", () => {
  const onCloseMock = jest.fn();
  render(
    <Toast
      toast={{
        id: "",
        level: ToastLevel.WARNING,
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
    <Toast
      toast={{
        id: "",
        level: ToastLevel.ERROR,
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
