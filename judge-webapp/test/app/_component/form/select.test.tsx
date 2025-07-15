import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Select } from "@/app/_component/form/select";

describe("Select", () => {
  it("renders select input with options", () => {
    const { result: form } = renderHook(() => useForm());
    const { result: s } = renderHook(() => useTranslations());
    const options = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ];
    form.current.setError("test", {
      type: "required",
      message: "This field is required",
    });

    render(
      <Select
        form={form.current}
        s={s.current}
        name="test"
        options={options}
        label="Test Select"
      />,
    );

    expect(screen.getByTestId("select:label")).toHaveTextContent("Test Select");
    expect(screen.getByTestId("select:error")).toHaveTextContent(
      "This field is required",
    );

    const opts = screen.getAllByTestId("select:option");
    expect(opts).toHaveLength(2);
    expect(opts[0]).toHaveTextContent("Option 1");
    expect(opts[1]).toHaveTextContent("Option 2");

    const select = screen.getByTestId("select:select");
    expect(select).toHaveValue("");

    fireEvent.change(select, { target: { value: "option1" } });
    expect(form.current.getValues().test).toEqual("option1");
  });
});
