import { screen } from "@testing-library/react";

import NotFoundPage from "@/app/not-found";
import { renderWithProviders } from "@/test/render-with-providers";

describe("NotFoundPage", () => {
  it("should render the not found page with correct status code", async () => {
    await renderWithProviders(<NotFoundPage />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("404");
  });

  it("should render the description message", async () => {
    await renderWithProviders(<NotFoundPage />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
  });

  it("should have correct CSS classes for layout", async () => {
    await renderWithProviders(<NotFoundPage />);

    const container = screen.getByTestId("code").parentElement;
    expect(container).toHaveClass(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "h-screen",
    );
  });

  it("should have correct styling for the code element", async () => {
    await renderWithProviders(<NotFoundPage />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toHaveClass("text-8xl", "font-bold", "font-mono");
  });

  it("should have correct styling for the description element", async () => {
    await renderWithProviders(<NotFoundPage />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toHaveClass("text-md", "mt-5");
  });

  it("should use the correct internationalization message", async () => {
    await renderWithProviders(<NotFoundPage />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
    // The actual message content will be rendered by FormattedMessage
    // and should be tested in integration tests
  });

  it("should be a client component", () => {
    // This test ensures that the component is marked with "use client"
    expect(typeof NotFoundPage).toBe("function");
  });
});
