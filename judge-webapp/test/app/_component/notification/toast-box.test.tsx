import { fireEvent, render, screen } from "@testing-library/react";
import { ToastBox } from "@/app/_component/notification/toast-box";
import {
  NotificationItemType,
  NotificationLevel,
  NotificationType,
} from "@/app/_component/context/notification-context";

describe("ToastBox", () => {
  it("renders without crashing", () => {
    const items = [
      {
        id: "1",
        type: NotificationType.TOAST,
        level: NotificationLevel.INFO,
        text: "Test toast 1",
        ttl: 5000,
      },
      {
        id: "2",
        type: NotificationType.TOAST,
        level: NotificationLevel.WARNING,
        text: "Test toast 2",
        ttl: 3000,
      },
    ] as NotificationItemType[];
    const onClose = jest.fn();

    render(<ToastBox items={items} onClose={onClose} />);

    const toasts = screen.getAllByTestId("toast");
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent("Test toast 1");
    expect(toasts[1]).toHaveTextContent("Test toast 2");
    fireEvent.click(toasts[0]);
    expect(onClose).toHaveBeenCalledWith("1");
    fireEvent.click(toasts[1]);
    expect(onClose).toHaveBeenCalledWith("2");
  });
});
