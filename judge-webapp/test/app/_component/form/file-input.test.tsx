import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FileInput } from "@/app/_component/form/file-input";

describe("FileInput", () => {
  (global.URL.createObjectURL as jest.Mock) = jest.fn(() => "blob:url");
  (global.URL.revokeObjectURL as jest.Mock) = jest.fn();

  const createObjectURLSpy = jest.spyOn(URL, "createObjectURL");
  const revokeObjectURLSpy = jest.spyOn(URL, "revokeObjectURL");
  const appendChildSpy = jest.spyOn(document.body, "appendChild");
  const removeChildSpy = jest.spyOn(document.body, "removeChild");

  it("renders file input with label", async () => {
    const { result: form } = renderHook(() => useForm());
    const { result: s } = renderHook(() => useTranslations());
    form.current.setError("test", {
      type: "required",
      message: "This field is required",
    });

    render(
      <FileInput
        form={form.current}
        s={s.current}
        name="test"
        label="Test File Input"
      />,
    );

    expect(screen.getByTestId("file-input:label")).toHaveTextContent(
      "Test File Input",
    );
    expect(screen.getByTestId("file-input:error")).toHaveTextContent(
      "This field is required",
    );

    const input = screen.getByTestId("file-input:input");
    const download = screen.getByTestId("file-input:download");
    const button = screen.getByTestId("file-input:button");

    fireEvent.click(download);
    expect(createObjectURLSpy).not.toHaveBeenCalled();

    expect(input).toHaveAttribute("type", "file");
    expect(button).toHaveTextContent("empty");

    const file = new File(["content"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(form.current.getValues().test).toEqual(file);
    expect(button).toHaveTextContent("test.txt");

    fireEvent.click(download);
    expect(createObjectURLSpy).toHaveBeenCalledWith(file);
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it("renders file input with original name", async () => {
    const { result: form } = renderHook(() => useForm());
    const { result: s } = renderHook(() => useTranslations());
    const onDownloadOriginal = jest.fn();
    const originalFile = { filename: "Original File Name" };
    form.current.setValue("originalFile", originalFile);

    render(
      <FileInput
        form={form.current}
        s={s.current}
        name="test"
        label="Test File Input"
        originalName="originalFile"
        onDownloadOriginal={onDownloadOriginal}
      />,
    );

    const download = screen.getByTestId("file-input:download");
    const button = screen.getByTestId("file-input:button");

    expect(button).toHaveTextContent("Original File Name");
    fireEvent.click(download);
    expect(onDownloadOriginal).toHaveBeenCalledWith(originalFile);
  });
});
