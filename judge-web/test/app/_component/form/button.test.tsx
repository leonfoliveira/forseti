import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/app/_component/form/button";

it("renders the button with default type as button", () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByTestId("button")).toHaveAttribute("type", "button");
});

it("renders the button with the provided type", () => {
  render(<Button type="submit">Submit</Button>);
  expect(screen.getByTestId("button")).toHaveAttribute("type", "submit");
});

it("applies additional class names to the button", () => {
  render(<Button className="custom-class">Styled Button</Button>);
  expect(screen.getByTestId("button")).toHaveClass("btn custom-class");
});

it("renders the button with a custom data-testid", () => {
  render(<Button data-testid="custom-button">Custom Button</Button>);
  expect(screen.getByTestId("custom-button")).toBeInTheDocument();
});

it("handles click events when the button is clicked", async () => {
  const onClickMock = jest.fn();
  render(<Button onClick={onClickMock}>Click Me</Button>);
  fireEvent.click(screen.getByTestId("button"));
  expect(onClickMock).toHaveBeenCalled();
});
