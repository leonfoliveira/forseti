import { fireEvent, render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";

import { FileInput } from "@/lib/component/form/file-input";

describe("FileInput", () => {
  const label = { id: "label", defaultMessage: "Test label" };

  const TestComponent = (props: any) => {
    const form = useForm({
      defaultValues: {
        originalValue: { filename: "original_value.csv" },
      },
    });
    return <FileInput form={form} name="test" label={label} {...props} />;
  };

  it("renders a file input with the given label", () => {
    render(<TestComponent />);
    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
    const label = screen.getByTestId("file-input:label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent("Test label");
  });

  it("should behave correctly without originalName", async () => {
    render(<TestComponent />);
    const input = screen.getByTestId("file-input");
    const button = screen.getByTestId("file-input:button");
    const downloadButton = screen.getByTestId("file-input:download");
    const resetButton = screen.getByTestId("file-input:reset");

    expect(button).toHaveTextContent("Select a file");
    expect(downloadButton).toBeDisabled();
    expect(resetButton).toBeDisabled();

    fireEvent.change(input, {
      target: {
        files: [new File(["test"], "test.csv", { type: "text/csv" })],
      },
    });
    expect(button).toHaveTextContent("test.csv");
    expect(downloadButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();

    fireEvent.click(resetButton);
    expect(button).toHaveTextContent("Select a file");
    expect(downloadButton).toBeDisabled();
    expect(resetButton).toBeDisabled();
  });

  it("should behave correctly with originalName", async () => {
    const onDownloadOriginal = jest.fn();
    render(
      <TestComponent
        originalName="originalValue"
        onDownloadOriginal={onDownloadOriginal}
      />,
    );
    const input = screen.getByTestId("file-input");
    const button = screen.getByTestId("file-input:button");
    const downloadButton = screen.getByTestId("file-input:download");
    const resetButton = screen.getByTestId("file-input:reset");

    expect(button).toHaveTextContent("original_value.csv");
    expect(downloadButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();

    fireEvent.change(input, {
      target: {
        files: [new File(["test"], "test.csv", { type: "text/csv" })],
      },
    });
    expect(button).toHaveTextContent("test.csv");
    expect(downloadButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();

    fireEvent.click(resetButton);
    expect(button).toHaveTextContent("original_value.csv");
    expect(downloadButton).not.toBeDisabled();
    expect(resetButton).not.toBeDisabled();
    fireEvent.click(downloadButton);
    expect(onDownloadOriginal).toHaveBeenCalledWith({
      filename: "original_value.csv",
    });
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
