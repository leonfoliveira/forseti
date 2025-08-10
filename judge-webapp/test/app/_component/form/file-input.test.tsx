import { render, screen } from "@testing-library/react";
import { FileInput } from "@/app/_component/form/file-input";
import { useForm } from "react-hook-form";

describe("FileInput", () => {
  const label = { id: "label", defaultMessage: "Test label" };

  const TestComponent = () => {
    const form = useForm();
    return <FileInput form={form} name="test" label={label} />;
  };

  it("renders a file input with the given label", () => {
    render(<TestComponent />);
    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
    const label = screen.getByTestId("file-input:label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label");
  });

  it("applies the given className to the input", () => {
    const TestComponentWithClassName = () => {
      const form = useForm();
      return (
        <FileInput form={form} name="test" label={label} className="my-class" />
      );
    };
    render(<TestComponentWithClassName />);
    const input = screen.getByTestId("file-input");
    expect(input).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    const TestComponentWithContainerClassName = () => {
      const form = useForm();
      return (
        <FileInput
          form={form}
          name="test"
          label={label}
          containerClassName="my-container-class"
        />
      );
    };
    render(<TestComponentWithContainerClassName />);
    const container = screen.getByTestId("file-input:container");
    expect(container).toHaveClass("my-container-class");
  });
});
