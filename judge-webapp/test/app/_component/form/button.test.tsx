
import { render, screen } from "@testing-library/react";
import { Button } from "@/app/_component/form/button";

describe("Button", () => {
  it("renders a button with the given children", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
  });

  it("disables the button when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("shows a spinner when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>);
    const spinner = screen.getByTestId("button:spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("does not show a spinner when isLoading is false", () => {
    render(<Button>Click me</Button>);
    const spinner = screen.queryByTestId("button:spinner");
    expect(spinner).not.toBeInTheDocument();
  });

  it("disables the button when disabled is true", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("applies the given className to the button", () => {
    render(<Button className="my-class">Click me</Button>);
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    render(<Button containerClassName="my-container-class">Click me</Button>);
    const container = screen.getByTestId("button:container");
    expect(container).toHaveClass("my-container-class");
  });

  it("shows a tooltip when the tooltip prop is provided", () => {
    render(<Button tooltip="My tooltip">Click me</Button>);
    const container = screen.getByTestId("button:container");
    expect(container).toHaveAttribute("data-tip", "My tooltip");
  });
});
