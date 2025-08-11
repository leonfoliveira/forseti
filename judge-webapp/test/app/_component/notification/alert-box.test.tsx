import { fireEvent, render, screen } from "@testing-library/react";
import { AlertBox } from "@/app/_component/notification/alert-box";
import {
  AlertLevel,
  alertsSlice,
  AlertType,
} from "@/store/slices/alerts-slice";
import { mockAppDispatch, mockUseAppSelector } from "@/test/jest.setup";

jest.mock("@/app/_component/notification/alert", () => ({
  Alert: ({
    alert,
    onClose,
  }: {
    alert: AlertType;
    onClose: (id: string) => void;
  }) => (
    <div data-testid="alert" onClick={() => onClose(alert.id)}>
      {alert.text.defaultMessage}
    </div>
  ),
}));

describe("AlertBox", () => {
  it("renders multiple alerts", () => {
    const alerts = [
      {
        id: "1",
        text: { id: "alert-1", defaultMessage: "Test message 1" },
        level: AlertLevel.INFO,
        ttl: 5000,
      },
      {
        id: "2",
        text: { id: "alert-2", defaultMessage: "Test message 2" },
        level: AlertLevel.SUCCESS,
        ttl: 5000,
      },
    ] as AlertType[];
    mockUseAppSelector.mockReturnValue(alerts);
    render(<AlertBox />);
    const alertElements = screen.getAllByTestId("alert");
    expect(alertElements).toHaveLength(2);
    expect(alertElements[0]).toHaveTextContent("Test message 1");
    expect(alertElements[1]).toHaveTextContent("Test message 2");
  });

  it("calls onClose when an alert is closed", () => {
    const alerts = [
      {
        id: "1",
        text: { id: "alert-1", defaultMessage: "Test message 1" },
        level: AlertLevel.INFO,
        ttl: 5000,
      },
    ] as AlertType[];
    mockUseAppSelector.mockReturnValue(alerts);
    render(<AlertBox />);
    const alertElement = screen.getByTestId("alert");
    fireEvent.click(alertElement);
    expect(mockAppDispatch).toHaveBeenCalledWith(
      alertsSlice.actions.close("1"),
    );
  });
});
