import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "@/app/_component/notification/toast";
import {
  NotificationItemType,
  NotificationLevel,
} from "@/app/_context/notification-context";

describe("Toast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders a toast with the given text and level", () => {
    const toast = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: NotificationLevel.INFO,
      ttl: 5000,
    } as NotificationItemType;
    render(<Toast toast={toast} onClose={() => {}} />);
    const toastElement = screen.getByTestId("toast");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveTextContent("Test message");
    expect(toastElement).toHaveClass("alert-info");
  });

  it("calls onClose after ttl", () => {
    const onCloseMock = jest.fn();
    const toast = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: NotificationLevel.INFO,
      ttl: 5000,
    } as NotificationItemType;
    render(<Toast toast={toast} onClose={onCloseMock} />);
    jest.advanceTimersByTime(5000);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close icon is clicked", () => {
    const onCloseMock = jest.fn();
    const toast = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: NotificationLevel.INFO,
      ttl: 5000,
    } as NotificationItemType;
    render(<Toast toast={toast} onClose={onCloseMock} />);
    const closeIcon = screen.getByTestId("toast-close-icon");
    fireEvent.click(closeIcon);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
