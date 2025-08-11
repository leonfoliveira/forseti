import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { NumberInput } from "@/app/_component/form/number-input";

describe("NumberInput", () => {
  const label = { id: "label", defaultMessage: "Test label" };

  const TestComponent = () => {
    const form = useForm();
    return <NumberInput form={form} name="test" label={label} />;
  };

  it("renders a number input with the given label", () => {
    render(<TestComponent />);
    const input = screen.getByTestId("number-input");
    expect(input).toBeInTheDocument();
    const label = screen.getByTestId("number-input:label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label");
  });

  it("applies the given className to the input", () => {
    const TestComponentWithClassName = () => {
      const form = useForm();
      return (
        <NumberInput
          form={form}
          name="test"
          label={label}
          className="my-class"
        />
      );
    };
    render(<TestComponentWithClassName />);
    const input = screen.getByTestId("number-input");
    expect(input).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    const TestComponentWithContainerClassName = () => {
      const form = useForm();
      return (
        <NumberInput
          form={form}
          name="test"
          label={label}
          containerClassName="my-container-class"
        />
      );
    };
    render(<TestComponentWithContainerClassName />);
    const container = screen.getByTestId("number-input:container");
    expect(container).toHaveClass("my-container-class");
  });
});
