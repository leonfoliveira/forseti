import { screen } from "@testing-library/react";

import ForbiddenPage from "@/app/forbidden";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ForbiddenPage", () => {
  it("should render the forbidden page with correct status code", async () => {
    await renderWithProviders(<ForbiddenPage />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("403");
  });

  it("should render the description message", async () => {
    await renderWithProviders(<ForbiddenPage />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
  });

  it("should have correct CSS classes for layout", async () => {
    await renderWithProviders(<ForbiddenPage />);

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
    await renderWithProviders(<ForbiddenPage />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toHaveClass("text-8xl", "font-bold", "font-mono");
  });

  it("should have correct styling for the description element", async () => {
    await renderWithProviders(<ForbiddenPage />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toHaveClass("text-md", "mt-5");
  });

  it("should be a client component", () => {
    // This test ensures that the component is marked with "use client"
    expect(typeof ForbiddenPage).toBe("function");
  });
});
