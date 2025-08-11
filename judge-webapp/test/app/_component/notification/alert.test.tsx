import { render, screen, fireEvent } from "@testing-library/react";

import { Alert } from "@/app/_component/notification/alert";
import { AlertLevel, AlertType } from "@/store/slices/alerts-slice";

describe("Alert", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders an alert with the given text and level", () => {
    const alert = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: AlertLevel.INFO,
      ttl: 5000,
    } as AlertType;
    render(<Alert alert={alert} onClose={() => {}} />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent("Test message");
    expect(alertElement).toHaveClass("alert-info");
  });

  it("calls onClose after ttl", () => {
    const onCloseMock = jest.fn();
    const alert = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: AlertLevel.INFO,
      ttl: 5000,
    } as AlertType;
    render(<Alert alert={alert} onClose={onCloseMock} />);
    jest.advanceTimersByTime(5000);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when alert is clicked", () => {
    const onCloseMock = jest.fn();
    const alert = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: AlertLevel.INFO,
      ttl: 5000,
    } as AlertType;
    render(<Alert alert={alert} onClose={onCloseMock} />);
    const alertElement = screen.getByTestId("alert");
    fireEvent.click(alertElement);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const alert = {
      id: "1",
      text: { id: "text", defaultMessage: "Test message" },
      level: AlertLevel.INFO,
      ttl: 5000,
    } as AlertType;
    render(<Alert alert={alert} onClose={() => {}} className="custom-class" />);
    const alertElement = screen.getByTestId("alert");
    expect(alertElement).toHaveClass("custom-class");
  });
});
