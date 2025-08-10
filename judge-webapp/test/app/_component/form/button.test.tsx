import { render, screen } from "@testing-library/react";
import { Button } from "@/app/_component/form/button";

describe("Button", () => {
  it("renders a button with the given children", () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon" />}
        label={{ id: "label", defaultMessage: "Click me" }}
        rightIcon={<span data-testid="right-icon" />}
      />,
    );
    const button = screen.getByTestId("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("disables the button when isLoading is true", () => {
    render(<Button isLoading />);
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("shows a spinner when isLoading is true", () => {
    render(<Button isLoading />);
    const spinner = screen.getByTestId("button:spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("does not show a spinner when isLoading is false", () => {
    render(<Button />);
    const spinner = screen.queryByTestId("button:spinner");
    expect(spinner).not.toBeInTheDocument();
  });

  it("disables the button when disabled is true", () => {
    render(<Button disabled />);
    const button = screen.getByTestId("button");
    expect(button).toBeDisabled();
  });

  it("applies the given className to the button", () => {
    render(<Button className="my-class" />);
    const button = screen.getByTestId("button");
    expect(button).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    render(<Button containerClassName="my-container-class" />);
    const container = screen.getByTestId("button:container");
    expect(container).toHaveClass("my-container-class");
  });

  it("shows a tooltip when the tooltip prop is provided", () => {
    render(<Button tooltip={{ id: "tooltip", defaultMessage: "Tooltip" }} />);
    const container = screen.getByTestId("button:container");
    expect(container).toHaveAttribute("data-tip", "tooltip");
  });
});
