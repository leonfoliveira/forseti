import { render, screen } from "@testing-library/react";
import React from "react";
import { Form } from "@/app/_component/form/form";

describe("Form", () => {
  it("renders the form with the correct children", () => {
    render(
      <Form data-testid="form" className="test-class">
        <div data-testid="content">Child Content</div>
      </Form>,
    );
    expect(screen.getByTestId("form")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("applies the disabled attribute to the fieldset when disabled is true", () => {
    render(
      <Form data-testid="form" disabled>
        <div>Child Content</div>
      </Form>,
    );
    expect(screen.getByTestId("form")).toBeDisabled();
  });

  it("does not apply the disabled attribute to the fieldset when disabled is false", () => {
    render(
      <Form data-testid="form" disabled={false}>
        <div>Child Content</div>
      </Form>,
    );
    expect(screen.getByTestId("form")).not.toBeDisabled();
  });

  it("applies additional props to the form element", () => {
    render(
      <Form data-testid="form" method="post">
        <div>Child Content</div>
      </Form>,
    );
    const formElement = screen.getByTestId("form").querySelector("form");
    expect(formElement).toHaveAttribute("method", "post");
  });
});
