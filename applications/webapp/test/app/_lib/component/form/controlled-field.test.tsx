import { screen, fireEvent } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { ControlledField } from "@/app/_lib/component/form/controlled-field";
import { renderWithProviders } from "@/test/render-with-providers";

interface TestFormValues {
  testField: string;
}

const TestComponent = ({
  onFieldChange,
  error,
}: {
  onFieldChange?: jest.Mock;
  error?: string;
}) => {
  const form = useForm<TestFormValues>({
    defaultValues: { testField: "" },
    errors: error ? ({ testField: { message: error } } as any) : undefined,
  });

  return (
    <ControlledField
      form={form}
      name="testField"
      label={{ id: "test.label", defaultMessage: "Test Label" }}
      field={<input type="text" data-testid="input-field" />}
      onChange={onFieldChange}
    />
  );
};

describe("ControlledField", () => {
  it("should render label with formatted message", async () => {
    await renderWithProviders(<TestComponent />);

    expect(screen.getByText("test.label")).toBeInTheDocument();
  });

  it("should render input field with correct id", async () => {
    await renderWithProviders(<TestComponent />);

    const input = screen.getByTestId("input-field") as HTMLInputElement;
    expect(input).toHaveAttribute("id", "testField");
  });

  it("should update form value when input changes", async () => {
    await renderWithProviders(<TestComponent />);

    const input = screen.getByTestId("input-field") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test value" } });

    expect(input.value).toBe("test value");
  });

  it("should call onChange callback when input changes", async () => {
    const onFieldChange = jest.fn();
    await renderWithProviders(<TestComponent onFieldChange={onFieldChange} />);

    const input = screen.getByTestId("input-field");
    fireEvent.change(input, { target: { value: "test" } });

    expect(onFieldChange).toHaveBeenCalled();
  });

  it("should display error message when field has error", async () => {
    await renderWithProviders(<TestComponent error="validation.required" />);

    expect(screen.getByText("validation.required")).toBeInTheDocument();
  });

  it("should not display error message when field has no error", async () => {
    await renderWithProviders(<TestComponent />);

    const fieldDescriptions = screen.queryAllByText(/./);
    const errorElements = fieldDescriptions.filter((el) =>
      el.className.includes("text-destructive"),
    );

    expect(errorElements).toHaveLength(0);
  });

  it("should apply destructive class to error message", async () => {
    await renderWithProviders(<TestComponent error="validation.invalid" />);

    const errorElement = screen.getByText("validation.invalid");
    expect(errorElement).toHaveClass("text-destructive");
  });

  it("should call both fieldProps.onChange and custom onChange", async () => {
    const onFieldChange = jest.fn();
    await renderWithProviders(<TestComponent onFieldChange={onFieldChange} />);

    const input = screen.getByTestId("input-field");
    fireEvent.change(input, { target: { value: "a" } });

    expect(onFieldChange).toHaveBeenCalled();
  });

  it("should preserve field props when cloning element", async () => {
    const TestComponentWithProps = () => {
      const form = useForm<TestFormValues>({
        defaultValues: { testField: "" },
      });

      return (
        <ControlledField
          form={form}
          name="testField"
          label={{ id: "test.label", defaultMessage: "Test Label" }}
          field={
            <input
              type="text"
              data-testid="input-field"
              placeholder="Enter value"
              className="custom-class"
            />
          }
        />
      );
    };

    await renderWithProviders(<TestComponentWithProps />);

    const input = screen.getByTestId("input-field") as HTMLInputElement;
    expect(input).toHaveAttribute("placeholder", "Enter value");
    expect(input).toHaveClass("custom-class");
  });
});
