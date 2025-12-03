import { fireEvent, screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";

import Error500Page from "@/app/error/500/page";
import { useRouter } from "@/test/jest.setup";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Error500Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the 500 error page with correct status code", async () => {
    await renderWithProviders(<Error500Page />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("500");
  });

  it("should render the description message", async () => {
    await renderWithProviders(<Error500Page />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
  });

  it("should not render the retry button when no previous path is provided", async () => {
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(null),
    });

    await renderWithProviders(<Error500Page />);

    const buttonElement = screen.queryByTestId("reload");
    expect(buttonElement).not.toBeInTheDocument();
  });

  it("should render the retry button when previous path is provided", async () => {
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue("/previous/path"),
    });

    await renderWithProviders(<Error500Page />);

    const buttonElement = screen.getByTestId("reload");
    expect(buttonElement).toBeInTheDocument();
  });

  it("should navigate to previous path when retry button is clicked", async () => {
    const previousPath = "/previous/path";
    (useSearchParams as jest.Mock).mockReturnValueOnce({
      get: jest.fn().mockReturnValue(previousPath),
    });

    await renderWithProviders(<Error500Page />);

    const buttonElement = screen.getByTestId("reload");
    fireEvent.click(buttonElement);

    expect(useRouter().push).toHaveBeenCalledWith(previousPath);
  });
});