import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import React from "react";

describe("CheckboxGroup Component", () => {
  it("renders no checkboxes when options are empty", () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm());
    render(
      <CheckboxGroup
        fm={form}
        name="test"
        label="Test Label"
        options={[]}
        data-testid="checkbox-group"
      />,
    );
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("checks multiple checkboxes when clicked", () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm());
    render(
      <CheckboxGroup
        fm={form}
        name="test"
        label="Test Label"
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ]}
        data-testid="checkbox-group"
      />,
    );
    const checkbox1 = screen.getByLabelText("Option 1");
    const checkbox2 = screen.getByLabelText("Option 2");
    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);
    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();
  });

  it("renders the error message when there is a validation error", () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm());
    form.setError("test", {
      type: "required",
      message: "This field is required",
    });
    render(
      <CheckboxGroup
        fm={form}
        name="test"
        label="Test Label"
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
        ]}
        data-testid="checkbox-group"
      />,
    );
    expect(screen.getByTestId("checkbox-group:error")).toHaveTextContent(
      "This field is required",
    );
  });
});
