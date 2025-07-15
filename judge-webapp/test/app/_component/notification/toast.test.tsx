import { fireEvent, render, screen } from "@testing-library/react";
import { Toast } from "@/app/_component/notification/toast";
import { NotificationItemType } from "@/app/_component/context/notification-context";

describe("Toast", () => {
  it("renders without crashing", () => {
    const toast = {
      level: "info",
      text: "Test toast",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    render(<Toast toast={toast} onClose={onClose} />);

    const toastElement = screen.getByTestId("toast");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveTextContent("Test toast");
  });

  it("calls onClose after ttl", () => {
    jest.useFakeTimers();
    const toast = {
      level: "info",
      text: "Test toast",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    render(<Toast toast={toast} onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();
    jest.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicked", () => {
    const toast = {
      level: "info",
      text: "Test toast",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    render(<Toast toast={toast} onClose={onClose} />);
    const toastElement = screen.getByTestId("toast");

    fireEvent.click(toastElement);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders close icon and calls onClose when clicked", () => {
    const toast = {
      level: "info",
      text: "Test toast with close icon",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    render(<Toast toast={toast} onClose={onClose} />);
    const closeIcon = screen.getByTestId("toast-close-icon");

    fireEvent.click(closeIcon);
    expect(onClose).toHaveBeenCalled();
  });
});
