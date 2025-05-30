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
      <button onClick={() => success("Success message")}>Add Alert</button>
    );
  };

  render(
    <AlertProvider>
      <TestComponent />
    </AlertProvider>,
  );

  fireEvent.click(screen.getByText("Add Alert"));

  expect(screen.getByText("Success message")).toBeInTheDocument();
});

it("removes an alert when the onClose function is triggered", () => {
  const TestComponent = () => {
    const { success } = useAlert();
    return (
      <button onClick={() => success("Success message")}>Add Alert</button>
    );
  };

  render(
    <AlertProvider>
      <TestComponent />
    </AlertProvider>,
  );

  fireEvent.click(screen.getByText("Add Alert"));
  fireEvent.click(screen.getByText("Success message"));

  expect(screen.queryByText("Success message")).not.toBeInTheDocument();
});

it("does not add duplicate alerts with the same id", () => {
  const TestComponent = () => {
    const { success } = useAlert();
    return (
      <button onClick={() => success("Duplicate message")}>Add Alert</button>
    );
  };

  render(
    <AlertProvider>
      <TestComponent />
    </AlertProvider>,
  );

  fireEvent.click(screen.getByText("Add Alert"));
  fireEvent.click(screen.getByText("Add Alert"));

  expect(screen.getAllByText("Duplicate message").length).toBe(2);
});
