
import { render, screen } from "@testing-library/react";
import { Checkbox } from "@/app/_component/form/checkbox";

describe("Checkbox", () => {
  it("renders a checkbox with the given children", () => {
    render(<Checkbox>My checkbox</Checkbox>);
    const checkbox = screen.getByTestId("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveTextContent("My checkbox");
  });

  it("applies the given className to the input", () => {
    render(<Checkbox className="my-class">My checkbox</Checkbox>);
    const input = screen.getByTestId("checkbox:input");
    expect(input).toHaveClass("my-class");
  });

  it("is checked when the checked prop is true", () => {
    render(
      <Checkbox checked onChange={() => {}}>
        My checkbox
      </Checkbox>,
    );
    const input = screen.getByTestId("checkbox:input") as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it("is not checked when the checked prop is false", () => {
    render(
      <Checkbox checked={false} onChange={() => {}}>
        My checkbox
      </Checkbox>,
    );
    const input = screen.getByTestId("checkbox:input") as HTMLInputElement;
    expect(input.checked).toBe(false);
  });
});
