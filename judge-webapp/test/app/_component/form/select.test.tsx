import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { Select } from "@/app/_component/form/select";

describe("Select", () => {
  const options = [
    { value: "1", label: { id: "option-1", defaultMessage: "Option 1" } },
    { value: "2", label: { id: "option-2", defaultMessage: "Option 2" } },
    { value: "3", label: { id: "option-3", defaultMessage: "Option 3" } },
  ];

  const TestComponent = () => {
    const form = useForm();
    return (
      <Select
        form={form}
        name="test"
        label={{ id: "select", defaultMessage: "Test label" }}
        options={options}
      />
    );
  };

  it("renders a select with the given options", () => {
    render(<TestComponent />);
    const select = screen.getByTestId("select");
    expect(select).toBeInTheDocument();
    const selectOptions = screen.getAllByTestId("select:option");
    expect(selectOptions).toHaveLength(3);
  });

  it("renders the label", () => {
    render(<TestComponent />);
    const label = screen.getByTestId("select:label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label");
  });

  it("applies the given className to the select", () => {
    const TestComponentWithClassName = () => {
      const form = useForm();
      return (
        <Select
          form={form}
          name="test"
          label={{ id: "label", defaultMessage: "Test label" }}
          options={options}
          className="my-class"
        />
      );
    };
    render(<TestComponentWithClassName />);
    const select = screen.getByTestId("select");
    expect(select).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    const TestComponentWithContainerClassName = () => {
      const form = useForm();
      return (
        <Select
          form={form}
          name="test"
          label={{ id: "label", defaultMessage: "Test label" }}
          options={options}
          containerClassName="my-container-class"
        />
      );
    };
    render(<TestComponentWithContainerClassName />);
    const container = screen.getByTestId("select:container");
    expect(container).toHaveClass("my-container-class");
  });
});
