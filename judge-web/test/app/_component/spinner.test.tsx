import { render, screen } from "@testing-library/react";
import { Spinner } from "@/app/_component/spinner";

it("renders with default size when size prop is not provided", () => {
  render(<Spinner data-testid="spinner" />);
  const spinner = screen.getByTestId("spinner");
  expect(spinner).toHaveClass("w-6 h-6");
});

it("renders with medium size when size is set to 'md'", () => {
  render(<Spinner size="md" data-testid="spinner" />);
  const spinner = screen.getByTestId("spinner");
  expect(spinner).toHaveClass("w-6 h-6");
});

it("renders with large size when size is set to 'lg'", () => {
  render(<Spinner size="lg" data-testid="spinner" />);
  const spinner = screen.getByTestId("spinner");
  expect(spinner).toHaveClass("w-12 h-12");
});

it("applies additional className to the spinner", () => {
  render(<Spinner className="custom-class" data-testid="spinner" />);
  const spinner = screen.getByTestId("spinner");
  expect(spinner).toHaveClass("custom-class");
});

it("renders without crashing when no props are provided", () => {
  render(<Spinner />);
  const spinner = screen.getByTestId("spinner");
  expect(spinner).toBeInTheDocument();
});
