import { screen } from "@testing-library/react";

import { Label } from "@/app/_lib/component/form/label";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Label", () => {
  it("should render with default size", async () => {
    await renderWithProviders(<Label>Test Label</Label>);

    const label = screen.getByText("Test Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-xs");
    expect(label).toHaveClass("text-foreground");
    expect(label).toHaveClass("font-semibold");
  });

  it("should render with small size", async () => {
    await renderWithProviders(<Label size="sm">Small Label</Label>);

    const label = screen.getByText("Small Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-xs");
  });

  it("should render with medium size", async () => {
    await renderWithProviders(<Label size="md">Medium Label</Label>);

    const label = screen.getByText("Medium Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-xs");
  });

  it("should render with large size", async () => {
    await renderWithProviders(<Label size="lg">Large Label</Label>);

    const label = screen.getByText("Large Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-sm");
  });

  it("should apply custom className", async () => {
    await renderWithProviders(
      <Label className="custom-class">Custom Label</Label>,
    );

    const label = screen.getByText("Custom Label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("custom-class");
    expect(label).toHaveClass("text-foreground");
    expect(label).toHaveClass("font-semibold");
  });

  it("should pass through HTML props", async () => {
    await renderWithProviders(
      <Label data-testid="test-label" id="label-id">
        HTML Props Label
      </Label>,
    );

    const label = screen.getByTestId("test-label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("id", "label-id");
  });

  it("should render as span element", async () => {
    await renderWithProviders(<Label>Span Label</Label>);

    const label = screen.getByText("Span Label");
    expect(label.tagName).toBe("SPAN");
  });
});
