import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { NumberInput } from "@/app/_component/form/number-input";

describe("NumberInput", () => {
  it("renders number input with validation", () => {
    const { result: form } = renderHook(() => useForm());
    const { result: s } = renderHook(() => useTranslations());
    form.current.setError("test", {
      type: "required",
      message: "This field is required",
    });

    render(
      <NumberInput
        form={form.current}
        s={s.current}
        name="test"
        label="Test Number Input"
      />,
    );

    expect(screen.getByTestId("number-input:label")).toHaveTextContent(
      "Test Number Input",
    );
    expect(screen.getByTestId("number-input:error")).toHaveTextContent(
      "This field is required",
    );

    const input = screen.getByTestId("number-input:input");
    expect(input).toHaveAttribute("type", "number");

    fireEvent.change(input, { target: { value: "42" } });
    expect(form.current.getValues().test).toEqual(42);
  });
});
