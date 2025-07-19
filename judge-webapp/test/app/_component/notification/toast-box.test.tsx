import { render, screen } from "@testing-library/react";
import { ToastBox } from "@/app/_component/notification/toast-box";
import {
  NotificationItemType,
  NotificationLevel,
} from "@/app/_component/context/notification-context";

jest.mock("@/app/_component/notification/toast", () => ({
  Toast: ({
    toast,
    onClose,
  }: {
    toast: NotificationItemType;
    onClose: (id: string) => void;
  }) => (
    <div data-testid="toast" onClick={() => onClose(toast.id)}>
      {toast.text}
    </div>
  ),
}));

describe("ToastBox", () => {
  it("renders multiple toasts", () => {
    const toasts = [
      {
        id: "1",
        text: "Test message 1",
        level: NotificationLevel.INFO,
        ttl: 5000,
      },
      {
        id: "2",
        text: "Test message 2",
        level: NotificationLevel.SUCCESS,
        ttl: 5000,
      },
    ] as NotificationItemType[];
    render(<ToastBox items={toasts} onClose={() => {}} />);
    const toastElements = screen.getAllByTestId("toast");
    expect(toastElements).toHaveLength(2);
    expect(toastElements[0]).toHaveTextContent("Test message 1");
    expect(toastElements[1]).toHaveTextContent("Test message 2");
  });

  it("calls onClose when a toast is closed", () => {
    const onCloseMock = jest.fn();
    const toasts = [
      {
        id: "1",
        text: "Test message 1",
        level: NotificationLevel.INFO,
        ttl: 5000,
      },
    ] as NotificationItemType[];
    render(<ToastBox items={toasts} onClose={onCloseMock} />);
    const toastElement = screen.getByTestId("toast");
    toastElement.click();
    expect(onCloseMock).toHaveBeenCalledWith("1");
  });
});
