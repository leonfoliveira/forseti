import { render, screen } from "@testing-library/react";
import { Checkbox } from "@/app/_component/form/checkbox";

describe("Checkbox", () => {
  const label = { id: "checkbox", defaultMessage: "My checkbox" };

  it("renders a checkbox with the given children", () => {
    render(<Checkbox label={label} />);
    const checkbox = screen.getByTestId("checkbox:label");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveTextContent("My checkbox");
  });

  it("applies the given className to the input", () => {
    render(<Checkbox className="my-class" label={label} />);
    const input = screen.getByTestId("checkbox");
    expect(input).toHaveClass("my-class");
  });

  it("is checked when the checked prop is true", () => {
    render(<Checkbox checked onChange={() => {}} label={label} />);
    const input = screen.getByTestId("checkbox") as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it("is not checked when the checked prop is false", () => {
    render(<Checkbox checked={false} onChange={() => {}} label={label} />);
    const input = screen.getByTestId("checkbox") as HTMLInputElement;
    expect(input.checked).toBe(false);
  });
});
