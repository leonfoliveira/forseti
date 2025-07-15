import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { DateTimeInput } from "@/app/_component/form/date-time-input";

describe("DateTimeInput", () => {
  it("renders date-time input", () => {
    const { result: form } = renderHook(() => useForm());
    const { result: s } = renderHook(() => useTranslations());
    form.current.setError("test", {
      type: "required",
      message: "This field is required",
    });

    render(
      <DateTimeInput
        form={form.current}
        s={s.current}
        name="test"
        label="Test DateTime Input"
      />,
    );

    expect(screen.getByTestId("date-input:error")).toHaveTextContent(
      "This field is required",
    );
    const input = screen.getByTestId("date-input:input");
    expect(input).toHaveAttribute("type", "datetime-local");
    expect(screen.getByTestId("date-input:label")).toHaveTextContent(
      "Test DateTime Input",
    );

    fireEvent.change(input, { target: { value: "2023-10-01T12:00" } });
    expect(form.current.getValues().test).toEqual(new Date("2023-10-01T12:00"));
  });
});
