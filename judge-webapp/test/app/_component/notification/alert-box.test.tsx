import { fireEvent, render, screen } from "@testing-library/react";
import { AlertBox } from "@/app/_component/notification/alert-box";
import {
  NotificationItemType,
  NotificationLevel,
} from "@/app/_component/context/notification-context";

jest.mock("@/app/_component/notification/alert", () => ({
  Alert: ({
    alert,
    onClose,
  }: {
    alert: NotificationItemType;
    onClose: (id: string) => void;
  }) => (
    <div data-testid="alert" onClick={() => onClose(alert.id)}>
      {alert.text}
    </div>
  ),
}));

describe("AlertBox", () => {
  it("renders multiple alerts", () => {
    const alerts = [
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
    render(<AlertBox items={alerts} onClose={() => {}} />);
    const alertElements = screen.getAllByTestId("alert");
    expect(alertElements).toHaveLength(2);
    expect(alertElements[0]).toHaveTextContent("Test message 1");
    expect(alertElements[1]).toHaveTextContent("Test message 2");
  });

  it("calls onClose when an alert is closed", () => {
    const onCloseMock = jest.fn();
    const alerts = [
      {
        id: "1",
        text: "Test message 1",
        level: NotificationLevel.INFO,
        ttl: 5000,
      },
    ] as NotificationItemType[];
    render(<AlertBox items={alerts} onClose={onCloseMock} />);
    const alertElement = screen.getByTestId("alert");
    fireEvent.click(alertElement);
    expect(onCloseMock).toHaveBeenCalledWith("1");
  });
});
