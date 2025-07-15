import { Form } from "@/app/_component/form/form";
import { render, screen } from "@testing-library/react";

describe("Form", () => {
  it("renders form with fieldset", () => {
    render(
      <Form disabled>
        <input data-testid="input" />
      </Form>,
    );

    const fieldset = screen.getByTestId("form");
    expect(fieldset).toBeDisabled();
    expect(screen.getByTestId("input")).toBeDisabled();
  });
});
