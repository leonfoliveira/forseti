import { render, screen } from "@testing-library/react";
import { Select } from "@/app/_component/form/select";
import { useForm } from "react-hook-form";

describe("Select", () => {
  const options = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  const TestComponent = () => {
    const form = useForm();
    return (
      <Select
        form={form}
        name="test"
        s={((key: string) => key) as any}
        label="Test label"
        options={options}
      />
    );
  };

  it("renders a select with the given options", () => {
    render(<TestComponent />);
    const select = screen.getByTestId("select:select");
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
          s={((key: string) => key) as any}
          label="Test label"
          options={options}
          className="my-class"
        />
      );
    };
    render(<TestComponentWithClassName />);
    const select = screen.getByTestId("select:select");
    expect(select).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    const TestComponentWithContainerClassName = () => {
      const form = useForm();
      return (
        <Select
          form={form}
          name="test"
          s={((key: string) => key) as any}
          label="Test label"
          options={options}
          containerClassName="my-container-class"
        />
      );
    };
    render(<TestComponentWithContainerClassName />);
    const container = screen.getByTestId("select");
    expect(container).toHaveClass("my-container-class");
  });
});
