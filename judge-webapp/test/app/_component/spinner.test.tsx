import { render, screen } from "@testing-library/react";
import { Spinner } from "@/app/_component/spinner";

describe("Spinner", () => {
  it("renders the spinner with default class", () => {
    render(<Spinner />);

    expect(screen.getByTestId("spinner")).toHaveClass("w-6", "h-6");
  });

  it("render spinner with md size", () => {
    render(<Spinner size="md" />);

    expect(screen.getByTestId("spinner")).toHaveClass("w-6", "h-6");
  });

  it("render spinner with lg size", () => {
    render(<Spinner size="lg" />);

    expect(screen.getByTestId("spinner")).toHaveClass("w-12", "h-12");
  });
});
