import { fireEvent, render, screen } from "@testing-library/react";
import { AlertProvider, useAlert } from "@/app/_component/alert/alert-provider";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "mocked-uuid"),
}));

it("renders no alerts when no alerts are added", () => {
  render(
    <AlertProvider>
      <div data-testid="child">Child Component</div>
    </AlertProvider>,
  );
  expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
});

it("renders an alert when a new alert is added", () => {
  const TestComponent = () => {
    const { success } = useAlert();
    return (
      <button onClick={() => success("Success message")} data-testid="add">
        Add Alert
      </button>
    );
  };

  render(
    <AlertProvider>
      <TestComponent />
    </AlertProvider>,
  );

  fireEvent.click(screen.getByTestId("add"));

  expect(screen.getByTestId("alert")).toHaveClass("alert-success");
});

it("removes an alert when the onClose function is triggered", () => {
  const TestComponent = () => {
    const { success } = useAlert();
    return (
      <button onClick={() => success("Success message")} data-testid="add">
        Add Alert
      </button>
    );
  };

  render(
    <AlertProvider>
      <TestComponent />
    </AlertProvider>,
  );

  fireEvent.click(screen.getByTestId("add"));

  expect(screen.getByTestId("alert")).toHaveClass("alert-success");

  fireEvent.click(screen.getByTestId("alert"));

  expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
});
