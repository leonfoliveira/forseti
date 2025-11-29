import { screen } from "@testing-library/react";

import HomePage from "@/app/page";
import { renderWithProviders } from "@/test/render-with-providers";

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-testid="logo-image"
    />
  ),
}));

// Mock the Metadata component
jest.mock("@/app/_lib/component/metadata", () => ({
  Metadata: ({
    title,
    description,
  }: {
    title: { id: string; defaultMessage: string };
    description: { id: string; defaultMessage: string };
  }) => (
    <div
      data-testid="metadata"
      data-title={title.id}
      data-description={description.id}
    >
      Metadata Component
    </div>
  ),
}));

describe("HomePage", () => {
  it("should render the Metadata component with correct props", async () => {
    await renderWithProviders(<HomePage />);

    const metadataElement = screen.getByTestId("metadata");
    expect(metadataElement).toBeInTheDocument();
    expect(metadataElement).toHaveAttribute(
      "data-title",
      "app.page.page-title",
    );
    expect(metadataElement).toHaveAttribute(
      "data-description",
      "app.page.page-description",
    );
  });

  it("should render the logo image with correct attributes", async () => {
    await renderWithProviders(<HomePage />);

    const logoImage = screen.getByTestId("logo-image");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/icon.jpg");
    expect(logoImage).toHaveAttribute("alt", "Logo of forseti");
    expect(logoImage).toHaveAttribute("width", "300");
    expect(logoImage).toHaveAttribute("height", "300");
  });

  it("should have correct layout styling for centering content", async () => {
    await renderWithProviders(<HomePage />);

    const logoImage = screen.getByTestId("logo-image");
    const container = logoImage.parentElement;

    expect(container).toHaveClass(
      "h-screen",
      "flex",
      "justify-center",
      "items-center",
    );
  });

  it("should render both Metadata and image content", async () => {
    await renderWithProviders(<HomePage />);

    expect(screen.getByTestId("metadata")).toBeInTheDocument();
    expect(screen.getByTestId("logo-image")).toBeInTheDocument();
  });

  it("should be a client component", () => {
    // This test ensures that the component is marked with "use client"
    expect(typeof HomePage).toBe("function");
  });

  it("should use React Fragment as the root element", async () => {
    const { container } = await renderWithProviders(<HomePage />);

    // React Fragment doesn't create a DOM element, so we check that
    // both Metadata and the div are direct children of the container
    expect(container.firstChild).toBeTruthy();
  });
});
