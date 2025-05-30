import { screen, fireEvent, render, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import React from "react";
import { NumberInput } from "@/app/_component/form/number-input";
import { TextInput } from "@/app/_component/form/text-input";

it("renders the number input with the correct label", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  render(
    <NumberInput
      fm={form}
      name="age"
      label="Enter your age"
      data-testid="number-input"
    />,
  );
  expect(screen.getByTestId("number-input:label")).toHaveTextContent(
    "Enter your age",
  );
});

it("updates the value when a valid number is entered", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  render(
    <NumberInput
      fm={form}
      name="age"
      label="Enter your age"
      data-testid="number-input"
    />,
  );
  const input = screen.getByTestId("number-input:input");
  fireEvent.change(input, { target: { value: "25" } });
  expect(input).toHaveValue(25);
});

it("clears the value when the input is reset", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  render(
    <NumberInput
      fm={form}
      name="age"
      label="Enter your age"
      data-testid="number-input"
    />,
  );
  const input = screen.getByTestId("number-input:input");
  fireEvent.change(input, { target: { value: "30" } });
  fireEvent.change(input, { target: { value: "" } });
  expect(input).toHaveValue(null);
});

it("does not allow non-numeric input", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  render(
    <NumberInput
      fm={form}
      name="age"
      label="Enter your age"
      data-testid="number-input"
    />,
  );
  const input = screen.getByTestId("number-input:input");
  fireEvent.change(input, { target: { value: "abc" } });
  expect(input).toHaveValue(null);
});

it("renders the error message when there is a validation error", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  form.setError("age", {
    type: "required",
    message: "This field is required",
  });
  render(
    <NumberInput
      fm={form}
      name="age"
      label="Enter your age"
      data-testid="number-input"
    />,
  );
  expect(screen.getByTestId("number-input:error")).toHaveTextContent(
    "This field is required",
  );
});
