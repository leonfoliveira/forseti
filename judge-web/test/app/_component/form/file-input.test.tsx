import { screen, fireEvent, renderHook, render } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { FileInput } from "@/app/_component/form/file-input";
import React from "react";
import { useTranslations } from "next-intl";

describe("FileInput", () => {
  const {
    result: { current: form },
  } = renderHook(() => useForm());
  const s = jest.fn().mockReturnValue("message") as unknown as ReturnType<
    typeof useTranslations
  >;

  it("renders the file input with the correct label", () => {
    render(
      <FileInput
        fm={form}
        name="file"
        s={s}
        label="Upload File"
        data-testid="file-input"
      />,
    );
    expect(screen.getByTestId("file-input:label")).toHaveTextContent(
      "Upload File",
    );
  });

  it("opens file dialog when the button is clicked", () => {
    render(
      <FileInput
        fm={form}
        name="file"
        s={s}
        label="Upload File"
        data-testid="file-input"
      />,
    );
    const fileInput = screen.getByTestId("file-input:label");
    const button = screen.getByTestId("file-input:button");
    fireEvent.click(button);
    expect(fileInput).toBeInTheDocument();
  });

  it("displays the selected file name after a file is chosen", () => {
    render(
      <FileInput
        fm={form}
        name="file"
        s={s}
        label="Upload File"
        data-testid="file-input"
      />,
    );
    const fileInput = screen.getByTestId("file-input:input");
    const button = screen.getByTestId("file-input:button");
    const file = new File(["content"], "example.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(button).toHaveTextContent("example.txt");
  });

  it("calls onDownloadOriginal when download button is clicked and original file exists", () => {
    const onDownloadOriginal = jest.fn();
    const {
      result: { current: form },
    } = renderHook(() =>
      useForm({
        defaultValues: { file: undefined, originalFile: {} },
      }),
    );
    render(
      <FileInput
        fm={form}
        name="file"
        s={s}
        label="Upload File"
        data-testid="file-input"
        originalName="originalFile"
        onDownloadOriginal={onDownloadOriginal}
      />,
    );

    const downloadButton = screen.getByTestId("file-input:download");
    fireEvent.click(downloadButton);
    expect(onDownloadOriginal).toHaveBeenCalled();
  });

  it("clears the selected file when reset button is clicked", () => {
    render(
      <FileInput
        fm={form}
        name="file"
        s={s}
        label="Upload File"
        data-testid="file-input"
      />,
    );
    const fileInput = screen.getByTestId("file-input:label");
    const resetButton = screen.getByTestId("file-input:reset");
    const file = new File(["content"], "example.txt", { type: "text/plain" });

    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(resetButton);
    expect(screen.getByTestId("file-input:input")).not.toHaveValue();
  });

  it("renders the error message when there is a validation error", () => {
    const {
      result: { current: form },
    } = renderHook(() => useForm());
    form.setError("file", {
      type: "required",
      message: "This field is required",
    });
    render(
      <FileInput
        fm={form}
        name="file"
        s={s}
        label="Upload File"
        data-testid="file-input"
      />,
    );
    expect(screen.getByTestId("file-input:error")).not.toBeEmptyDOMElement();
  });
});
