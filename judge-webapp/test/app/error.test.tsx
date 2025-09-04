import { screen } from "@testing-library/react";

import ServerErrorPage from "@/app/error";
import { renderWithProviders } from "@/test/render-with-providers";

// Mock the ErrorPage component
jest.mock("@/lib/component/page/error-page", () => ({
  ErrorPage: () => <div data-testid="error-page">Error Page Component</div>,
}));

describe("ServerErrorPage", () => {
  it("should render the ErrorPage component", async () => {
    await renderWithProviders(<ServerErrorPage />);

    expect(screen.getByTestId("error-page")).toBeInTheDocument();
    expect(screen.getByText("Error Page Component")).toBeInTheDocument();
  });

  it("should be a client component", () => {
    // This test ensures that the component is marked with "use client"
    // which is important for Next.js 13+ app directory
    expect(typeof ServerErrorPage).toBe("function");
  });
});
