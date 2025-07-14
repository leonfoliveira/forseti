import { render, screen } from "@testing-library/react";
import {
  NotificationItemType,
  NotificationProvider,
  useAlert,
  useToast,
} from "@/app/_component/context/notification-context";

jest.mock("@/app/_component/context/notification-context", () => {
  return jest.requireActual("@/app/_component/context/notification-context");
});

jest.mock("@/app/_component/notification/alert-box", () => ({
  AlertBox: jest.fn(({ items }) => (
    <div data-testid="alert-box">
      {items.map((item: NotificationItemType) => (
        <div key={item.id}>{item.text}</div>
      ))}
    </div>
  )),
}));

jest.mock("@/app/_component/notification/toast-box", () => ({
  ToastBox: jest.fn(({ items }) => (
    <div data-testid="toast-box">
      {items.map((item: NotificationItemType) => (
        <div key={item.id}>{item.text}</div>
      ))}
    </div>
  )),
}));

describe("NotificationProvider", () => {
  it("displays alert notifications", async () => {
    const TestComponent = () => {
      const { info } = useAlert();
      return (
        <button onClick={() => info("Alert message")} data-testid="show-alert">
          Show Alert
        </button>
      );
    };

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    screen.getByText("Show Alert").click();
    expect(await screen.findByTestId("show-alert")).toBeInTheDocument();
    expect(screen.getByTestId("alert-box")).toBeInTheDocument();
    expect(screen.getByTestId("toast-box")).toBeInTheDocument();
  });

  it("displays toast notifications", async () => {
    const TestComponent = () => {
      const { success } = useToast();
      return (
        <button
          onClick={() => success("Toast message")}
          data-testid="show-toast"
        >
          Show Toast
        </button>
      );
    };

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    screen.getByText("Show Toast").click();
    expect(await screen.findByTestId("show-toast")).toBeInTheDocument();
  });

  it("handles notifications with different levels", async () => {
    const TestComponent = () => {
      const { warning } = useToast();
      return (
        <button
          onClick={() => warning("Warning message")}
          data-testid="show-warning"
        >
          Show Warning
        </button>
      );
    };

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    screen.getByTestId("show-warning").click();
    expect(await screen.findByText("Warning message")).toBeInTheDocument();
  });

  it("handles notifications with custom TTL", async () => {
    const TestComponent = () => {
      const { error } = useAlert();
      return (
        <button
          onClick={() => error("Error message", 5000)}
          data-testid="show-alert"
        >
          Show Error
        </button>
      );
    };

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    screen.getByTestId("show-alert").click();
    expect(await screen.findByText("Error message")).toBeInTheDocument();
  });
});
