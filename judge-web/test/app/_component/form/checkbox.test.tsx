import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "@/app/_component/form/checkbox";

it("renders the checkbox with default data-testid", () => {
  render(<Checkbox>Label</Checkbox>);
  expect(screen.getByTestId("checkbox")).toBeInTheDocument();
  expect(screen.getByTestId("checkbox:label")).toBeInTheDocument();
});

it("renders the checkbox with a custom data-testid", () => {
  render(<Checkbox data-testid="custom-checkbox">Label</Checkbox>);
  expect(screen.getByTestId("custom-checkbox")).toBeInTheDocument();
  expect(screen.getByTestId("custom-checkbox:label")).toBeInTheDocument();
});

it("applies additional class names to the checkbox", () => {
  render(<Checkbox className="custom-class">Label</Checkbox>);
  expect(screen.getByTestId("checkbox:input")).toHaveClass(
    "toggle custom-class",
  );
});

it("renders children inside the label", () => {
  render(<Checkbox>Custom Label</Checkbox>);
  expect(screen.getByText("Custom Label")).toBeInTheDocument();
});

it("handles click events on the checkbox", async () => {
  const onChangeMock = jest.fn();
  render(<Checkbox onChange={onChangeMock}>Label</Checkbox>);
  fireEvent.click(screen.getByTestId("checkbox:input"));
  expect(onChangeMock).toHaveBeenCalled();
});
