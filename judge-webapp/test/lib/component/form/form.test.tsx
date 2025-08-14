import { render, screen } from "@testing-library/react";

import { Form } from "@/lib/component/form/form";

describe("Form", () => {
  it("renders a form with the given children", () => {
    render(
      <Form>
        <div data-testid="child">Child</div>
      </Form>,
    );
    const form = screen.getByTestId("form");
    expect(form).toBeInTheDocument();
    const child = screen.getByTestId("child");
    expect(child).toBeInTheDocument();
  });

  it("disables the form when the disabled prop is true", () => {
    render(
      <Form disabled>
        <div data-testid="child">Child</div>
      </Form>,
    );
    const form = screen.getByTestId("form:container");
    expect(form).toBeDisabled();
  });

  it("applies the given className", () => {
    render(
      <Form className="my-class">
        <div data-testid="child">Child</div>
      </Form>,
    );
    const form = screen.getByTestId("form");
    expect(form).toHaveClass("my-class");
  });
});
