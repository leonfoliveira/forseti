import { render, screen } from "@testing-library/react";
import { TextInput } from "@/app/_component/form/text-input";
import { useForm } from "react-hook-form";

describe("TextInput", () => {
  const TestComponent = () => {
    const form = useForm();
    return (
      <TextInput
        form={form}
        name="test"
        s={((key: string) => key) as any}
        label="Test label"
      />
    );
  };

  it("renders a text input with the given label", () => {
    render(<TestComponent />);
    const input = screen.getByTestId("text-input");
    expect(input).toBeInTheDocument();
    const label = screen.getByTestId("text-input:label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label");
  });

  it("applies the given className to the input", () => {
    const TestComponentWithClassName = () => {
      const form = useForm();
      return (
        <TextInput
          form={form}
          name="test"
          s={((key: string) => key) as any}
          label="Test label"
          className="my-class"
        />
      );
    };
    render(<TestComponentWithClassName />);
    const input = screen.getByTestId("text-input");
    expect(input).toHaveClass("my-class");
  });

  it("applies the given containerClassName to the container", () => {
    const TestComponentWithContainerClassName = () => {
      const form = useForm();
      return (
        <TextInput
          form={form}
          name="test"
          s={((key: string) => key) as any}
          label="Test label"
          containerClassName="my-container-class"
        />
      );
    };
    render(<TestComponentWithContainerClassName />);
    const container = screen.getByTestId("text-input:container");
    expect(container).toHaveClass("my-container-class");
  });

  it("renders a password input when the password prop is true", () => {
    const TestComponentWithPassword = () => {
      const form = useForm();
      return (
        <TextInput
          form={form}
          name="test"
          s={((key: string) => key) as any}
          label="Test label"
          password
        />
      );
    };
    render(<TestComponentWithPassword />);
    const input = screen.getByTestId("text-input");
    expect(input).toHaveAttribute("type", "password");
  });
});
