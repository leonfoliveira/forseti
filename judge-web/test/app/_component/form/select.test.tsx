import { screen, fireEvent, render, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import React from "react";
import { Select } from "@/app/_component/form/select";
import { TextInput } from "@/app/_component/form/text-input";

it("renders the select input with an empty option by default", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  render(
    <Select
      fm={form}
      name="category"
      label="Select a category"
      options={[{ value: "1", label: "Option 1" }]}
      data-testid="select"
    />,
  );
  const emptyOption = screen.getByRole("option", { name: "" });
  expect(emptyOption).toBeInTheDocument();
});

it("does not update the value when an invalid option is selected", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  render(
    <Select
      fm={form}
      name="category"
      label="Select a category"
      options={[{ value: "1", label: "Option 1" }]}
      data-testid="select"
    />,
  );
  const select = screen.getByTestId("select:select");
  fireEvent.change(select, { target: { value: "invalid" } });
  expect(select).toHaveValue("");
});

it("renders the error message when there is a validation error", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  form.setError("category", {
    type: "required",
    message: "This field is required",
  });
  render(
    <Select
      fm={form}
      name="category"
      label="Select a category"
      options={[{ value: "1", label: "Option 1" }]}
      data-testid="select"
    />,
  );
  expect(screen.getByTestId("select:error")).toHaveTextContent(
    "This field is required",
  );
});
