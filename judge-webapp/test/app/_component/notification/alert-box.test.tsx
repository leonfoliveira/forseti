import { fireEvent, render, screen } from "@testing-library/react";
import { AlertBox } from "@/app/_component/notification/alert-box";
import {
  NotificationItemType,
  NotificationLevel,
  NotificationType,
} from "@/app/_component/context/notification-context";

describe("AlertBox", () => {
  it("renders without crashing", () => {
    const items = [
      {
        id: "1",
        type: NotificationType.ALERT,
        level: NotificationLevel.INFO,
        text: "Test alert 1",
        ttl: 5000,
      },
      {
        id: "2",
        type: NotificationType.ALERT,
        level: NotificationLevel.WARNING,
        text: "Test alert 2",
        ttl: 3000,
      },
    ] as NotificationItemType[];
    const onClose = jest.fn();

    render(<AlertBox items={items} onClose={onClose} />);

    const alerts = screen.getAllByTestId("alert");
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent("Test alert 1");
    expect(alerts[1]).toHaveTextContent("Test alert 2");
    fireEvent.click(alerts[0]);
    expect(onClose).toHaveBeenCalledWith("1");
    fireEvent.click(alerts[1]);
    expect(onClose).toHaveBeenCalledWith("2");
  });
});
