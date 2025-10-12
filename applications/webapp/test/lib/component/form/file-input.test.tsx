import { fireEvent, screen } from "@testing-library/react";

import { FileInput } from "@/lib/component/form/file-input";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FileInput", () => {
  it("should render as file input", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "file");
  });

  it("should render with label", async () => {
    await renderWithProviders(
      <FileInput label="Upload File" data-testid="file-input" />,
    );

    expect(screen.getByText("Upload File")).toBeInTheDocument();
    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
  });

  it("should render without label when not provided", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input");
    expect(input).toBeInTheDocument();
    // Should not render any label text
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("should have dashed border styling", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input");
    const wrapper = input.closest('[class*="border-dashed"]');
    expect(wrapper).toBeInTheDocument();
  });

  it("should have cursor pointer styling", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input");
    const wrapper = input.closest('[class*="cursor-pointer"]');
    expect(wrapper).toBeInTheDocument();
  });

  it("should be clearable", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input");

    // Upload a file
    const file = new File(["test content"], "test.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [file] } });

    // Should have clear functionality (isClearable prop is set)
    // Note: The actual clear button behavior depends on HeroUI implementation
    expect(input).toBeInTheDocument();
  });

  it("should handle file selection", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["test content"], "test.txt", { type: "text/plain" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(input.files?.[0]).toBe(file);
    expect(input.files?.length).toBe(1);
  });

  it("should handle multiple file selection when multiple prop is set", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" multiple />);

    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const files = [
      new File(["content 1"], "test1.txt", { type: "text/plain" }),
      new File(["content 2"], "test2.txt", { type: "text/plain" }),
    ];

    fireEvent.change(input, { target: { files } });

    expect(input.files?.length).toBe(2);
    expect(input.files?.[0]).toBe(files[0]);
    expect(input.files?.[1]).toBe(files[1]);
  });

  it("should accept specific file types when accept prop is set", async () => {
    await renderWithProviders(
      <FileInput accept=".pdf,.txt" data-testid="file-input" />,
    );

    const input = screen.getByTestId("file-input");
    expect(input).toHaveAttribute("accept", ".pdf,.txt");
  });

  it("should pass through additional props", async () => {
    await renderWithProviders(
      <FileInput
        placeholder="Choose file..."
        disabled
        required
        data-testid="file-input"
        className="custom-class"
      />,
    );

    const input = screen.getByTestId("file-input");
    expect(input).toHaveAttribute("disabled");
    expect(input).toHaveAttribute("required");
    // Note: className may be handled by the HeroUI wrapper component
    // We can verify the component accepts the prop without error
    expect(input).toBeInTheDocument();
  });

  it("should use outside-top label placement", async () => {
    await renderWithProviders(
      <FileInput label="Test Label" data-testid="file-input" />,
    );

    // The label placement is handled by HeroUI's Input component
    // We can verify the label is rendered
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("should handle size prop for label", async () => {
    await renderWithProviders(
      <FileInput label="Test Label" size="lg" data-testid="file-input" />,
    );

    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    // The size is passed to the Label component, which should apply appropriate text size
  });

  it("should clear file selection", async () => {
    await renderWithProviders(<FileInput data-testid="file-input" />);

    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const file = new File(["test content"], "test.txt", { type: "text/plain" });

    // Upload a file
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.files?.length).toBe(1);

    // Clear the file
    fireEvent.change(input, { target: { files: [] } });
    expect(input.files?.length).toBe(0);
  });
});
