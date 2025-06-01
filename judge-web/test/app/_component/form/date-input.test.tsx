import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { DateInput } from "@/app/_component/form/date-input";
import React from "react";
import { useTranslations } from "next-intl";

describe("DateInput", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());

  const s = jest.fn().mockReturnValue("message") as unknown as ReturnType<
    typeof useTranslations
  >;

  it("renders the date input with the correct label", () => {
    render(
      <DateInput
        fm={form}
        name="date"
        s={s}
        label="Select Date"
        data-testid="date-input"
      />,
    );
    expect(screen.getByTestId("date-input:label")).toHaveTextContent(
      "Select Date",
    );
  });

  it("renders the date input with a default value", async () => {
    const date = new Date("2023-01-01T12:00");
    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        defaultValues: { date },
      }),
    );
    render(
      <DateInput
        fm={form}
        name="date"
        s={s}
        label="Select Date"
        data-testid="date-input"
      />,
    );
    const input = screen.getByTestId("date-input:input") as HTMLInputElement;
    expect(input.value).toBe(date.toISOString().slice(0, 16));
  });

  it("updates the value when a new date is selected", async () => {
    render(
      <DateInput
        fm={form}
        name="date"
        s={s}
        label="Select Date"
        data-testid="date-input"
      />,
    );
    const input = screen.getByTestId("date-input:input") as HTMLInputElement;
    const newDate = "2025-05-30T21:30:33.650Z";
    fireEvent.change(input, { target: { value: newDate } });
  });

  it("displays an error message when fieldState contains an error", () => {
    render(
      <DateInput
        fm={form}
        name="date"
        s={s}
        label="Select Date"
        data-testid="date-input"
      />,
    );
    expect(screen.queryByText("Error message")).not.toBeInTheDocument();
  });

  it("applies additional class names to the container", () => {
    render(
      <DateInput
        fm={form}
        name="date"
        s={s}
        label="Select Date"
        containerClassName="custom-container"
        data-testid="date-input"
      />,
    );
    expect(screen.getByTestId("date-input")).toHaveClass("custom-container");
  });

  it("renders the error message when there is a validation error", () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm());
    form.setError("date", {
      type: "required",
      message: "This field is required",
    });
    render(
      <DateInput
        fm={form}
        name="date"
        s={s}
        label="Select Date"
        containerClassName="custom-container"
        data-testid="date-input"
      />,
    );
    expect(screen.getByTestId("date-input:error")).not.toBeEmptyDOMElement();
  });
});
