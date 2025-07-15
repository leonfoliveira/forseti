import { CheckboxGroup } from "@/app/_component/form/checkbox-group";
import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

describe("CheckboxGroup", () => {
  it("renders checkbox group with options", () => {
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
      <CheckboxGroup
        form={form.current}
        s={s.current}
        name="test"
        options={options}
        label="Test Checkbox Group"
      />,
    );

    expect(screen.getByTestId("test-checkbox-group:error")).toHaveTextContent(
      "This field is required",
    );
    const checkboxes = screen.getAllByTestId(
      "test-checkbox-group:checkbox:input",
    );
    expect(screen.getByTestId("test-checkbox-group:label")).toHaveTextContent(
      "Test Checkbox Group",
    );
    expect(checkboxes).toHaveLength(2);
    fireEvent.click(checkboxes[0]);
    expect(form.current.getValues().test).toEqual(["option1"]);
  });
});
