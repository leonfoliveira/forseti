import { fireEvent, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

import Error503Page from "@/app/error/503/page";
import { useRouter } from "@/test/jest.setup";
import { renderWithProviders } from "@/test/render-with-providers";

// Mock Suspense fallback
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  Suspense: ({ children }: { children: React.ReactNode }) => children,
}));

describe("Error503Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 503 error page with correct status code", async () => {
    await renderWithProviders(<Error503Page />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("503");
  });

  it("should render the description message", async () => {
    await renderWithProviders(<Error503Page />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
  });

  it("should not render the retry button when no previous path is provided", async () => {
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(null),
    });

    await renderWithProviders(<Error503Page />);

    const buttonElement = screen.queryByTestId("reload");
    expect(buttonElement).not.toBeInTheDocument();
  });

  it("should render the retry button when previous path is provided", async () => {
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue("/previous/path"),
    });

    await renderWithProviders(<Error503Page />);

    const buttonElement = screen.getByTestId("reload");
    expect(buttonElement).toBeInTheDocument();
  });

  it("should navigate to previous path when retry button is clicked", async () => {
    const previousPath = "/previous/path";
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(previousPath),
    });

    await renderWithProviders(<Error503Page />);

    const buttonElement = screen.getByTestId("reload");
    fireEvent.click(buttonElement);

    expect(useRouter().push).toHaveBeenCalledWith(previousPath);
  });
});
