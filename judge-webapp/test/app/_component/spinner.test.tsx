import { render, screen } from "@testing-library/react";
import { Spinner } from "@/app/_component/spinner";

describe("Spinner", () => {
  it("renders a spinner with default size", () => {
    render(<Spinner />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("w-6 h-6");
  });

  it("renders a spinner with md size", () => {
    render(<Spinner size="md" />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("w-6 h-6");
  });

  it("renders a spinner with lg size", () => {
    render(<Spinner size="lg" />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("w-12 h-12");
  });

  it("applies custom className", () => {
    render(<Spinner className="custom-class" />);
    const spinner = screen.getByTestId("spinner");
    expect(spinner).toHaveClass("custom-class");
  });
});
