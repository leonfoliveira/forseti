import { render, screen } from "@testing-library/react";
import { Alert } from "@/app/_component/notification/alert";
import { NotificationItemType } from "@/app/_component/context/notification-context";

describe("Alert", () => {
  it("renders without crashing", () => {
    const alert = {
      level: "info",
      text: "This is a test alert",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    const { getByTestId } = render(<Alert alert={alert} onClose={onClose} />);

    expect(getByTestId("alert")).toBeInTheDocument();
  });

  it("calls onClose after ttl", () => {
    jest.useFakeTimers();
    const alert = {
      level: "info",
      text: "This is a test alert",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    render(<Alert alert={alert} onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();
    jest.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicked", () => {
    const alert = {
      level: "info",
      text: "This is a test alert",
      ttl: 5000,
    } as unknown as NotificationItemType;
    const onClose = jest.fn();

    render(<Alert alert={alert} onClose={onClose} />);
    const alertElement = screen.getByTestId("alert");

    alertElement.click();
    expect(onClose).toHaveBeenCalled();
  });
});
