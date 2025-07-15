import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { TextInput } from "@/app/_component/form/text-input";

describe("TextInput", () => {
  it("renders text input with validation", () => {
    const { result: form } = renderHook(() => useForm());
    const { result: s } = renderHook(() => useTranslations());
    form.current.setError("test", {
      type: "required",
      message: "This field is required",
    });

    render(
      <TextInput
        form={form.current}
        s={s.current}
        name="test"
        label="Test Text Input"
      />,
    );

    expect(screen.getByTestId("text-input:label")).toHaveTextContent(
      "Test Text Input",
    );
    expect(screen.getByTestId("text-input:error")).toHaveTextContent(
      "This field is required",
    );

    const input = screen.getByTestId("text-input:input");
    expect(input).toHaveAttribute("type", "text");

    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(form.current.getValues().test).toEqual("Hello World");
  });
});
