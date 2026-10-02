import { render, screen } from "@testing-library/react";

import { Form } from "@/app/_lib/component/form/Form";

describe("Form", () => {
  it("wraps children in a form element", () => {
    render(<Form data-testid="form"><input aria-label="name" /></Form>);
    expect(screen.getByTestId("form")).toContainElement(screen.getByLabelText("name"));
    expect(screen.getByTestId("form")).toHaveAttribute("role", "form");
  });
});
