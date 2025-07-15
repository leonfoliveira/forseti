import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "@/app/_component/form/checkbox";

describe("Checkbox", () => {
  it("renders checkbox with label", () => {
    const onChange = jest.fn();
    render(<Checkbox onChange={onChange}>Accept Terms</Checkbox>);

    const checkbox = screen.getByTestId("checkbox:input");
    expect(screen.getByTestId("checkbox:label")).toHaveTextContent(
      "Accept Terms",
    );
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
