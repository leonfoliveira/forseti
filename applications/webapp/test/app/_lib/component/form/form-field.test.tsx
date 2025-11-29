import { fireEvent, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { FileInput } from "@/app/_lib/component/form/file-input";
import { FormField } from "@/app/_lib/component/form/form-field";
import { Input, Select, SelectItem } from "@/app/_lib/heroui-wrapper";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FormField", () => {
  it("should wrap Input with Controller", async () => {
    const { result } = renderHook(() => useForm());
    result.current.setError("testField", {
      type: "manual",
      message:
        "app.[slug].(dashboard)._common._form.announcement-form-schema.text-required",
    });

    await renderWithProviders(
      <FormField form={result.current} name="testField">
        <Input data-testid="input" />
      </FormField>,
    );

    const input = screen.getByTestId("input");
    expect(screen.getByText("Required")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "new value" } });
    expect(result.current.getValues("testField")).toBe("new value");
  });

  it("should wrap FileInput with Controller", async () => {
    const { result } = renderHook(() => useForm());
    result.current.setError("testField", {
      type: "manual",
      message:
        "app.[slug].(dashboard)._common._form.announcement-form-schema.text-required",
    });

    await renderWithProviders(
      <FormField form={result.current} name="testField" isFile>
        <FileInput data-testid="file-input" label={"Label"} />
      </FormField>,
    );

    const input = screen.getByTestId("file-input");
    expect(screen.getByText("Required")).toBeInTheDocument();
    const files = [new File(["new file content"], "new-file.txt")];
    fireEvent.change(input, { target: { files } });
    expect(result.current.getValues("testField")).toBe(files);
  });

  it("should wrap Select with Controller", async () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { testField: "option1" },
      }),
    );
    result.current.setError("testField", {
      type: "manual",
      message:
        "app.[slug].(dashboard)._common._form.announcement-form-schema.text-required",
    });

    await renderWithProviders(
      <FormField form={result.current} name="testField" isSelect>
        <Select data-testid="select" label="Label">
          <SelectItem key="option1">Option 1</SelectItem>
          <SelectItem key="option2">Option 2</SelectItem>
        </Select>
      </FormField>,
    );

    const input = screen.getByTestId("select");
    expect(screen.getByText("Required")).toBeInTheDocument();
    fireEvent.change(input, { target: { value: "option1" } });
    expect(result.current.getValues("testField")).toBe("option1");
  });
});
