import { fireEvent, screen } from "@testing-library/react";

import { Form } from "@/lib/component/form/form";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Form", () => {
  it("should render as form element", async () => {
    await renderWithProviders(
      <Form data-testid="test-form">
        <input type="text" placeholder="Test input" />
      </Form>,
    );

    const form = screen.getByTestId("test-form");
    expect(form).toBeInTheDocument();
    expect(form.tagName).toBe("FORM");
  });

  it("should have role='form' attribute", async () => {
    await renderWithProviders(
      <Form data-testid="test-form">
        <input type="text" placeholder="Test input" />
      </Form>,
    );

    const form = screen.getByTestId("test-form");
    expect(form).toHaveAttribute("role", "form");
  });

  it("should render children", async () => {
    await renderWithProviders(
      <Form>
        <input type="text" placeholder="Child input" />
        <button type="submit">Submit</button>
      </Form>,
    );

    expect(screen.getByPlaceholderText("Child input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    const mockSubmit = jest.fn();

    await renderWithProviders(
      <Form onSubmit={mockSubmit} data-testid="test-form">
        <input type="text" name="testField" defaultValue="test value" />
        <button type="submit">Submit</button>
      </Form>,
    );

    const form = screen.getByTestId("test-form");
    fireEvent.submit(form);

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it("should pass through HTML form attributes", async () => {
    await renderWithProviders(
      <Form
        method="POST"
        action="/test-action"
        encType="multipart/form-data"
        data-testid="test-form"
      >
        <input type="text" placeholder="Test input" />
      </Form>,
    );

    const form = screen.getByTestId("test-form");
    expect(form).toHaveAttribute("method", "POST");
    expect(form).toHaveAttribute("action", "/test-action");
    expect(form).toHaveAttribute("enctype", "multipart/form-data");
  });

  it("should apply custom className", async () => {
    await renderWithProviders(
      <Form className="custom-form-class" data-testid="test-form">
        <input type="text" placeholder="Test input" />
      </Form>,
    );

    const form = screen.getByTestId("test-form");
    expect(form).toHaveClass("custom-form-class");
  });

  it("should handle form events", async () => {
    const mockChange = jest.fn();
    const mockReset = jest.fn();

    await renderWithProviders(
      <Form onChange={mockChange} onReset={mockReset} data-testid="test-form">
        <input type="text" name="testField" />
        <button type="reset">Reset</button>
      </Form>,
    );

    const input = screen.getByRole("textbox");
    const resetButton = screen.getByRole("button", { name: "Reset" });

    fireEvent.change(input, { target: { value: "new value" } });
    expect(mockChange).toHaveBeenCalled();

    fireEvent.click(resetButton);
    expect(mockReset).toHaveBeenCalled();
  });
});
