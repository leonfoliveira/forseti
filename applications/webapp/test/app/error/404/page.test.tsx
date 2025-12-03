import { screen } from "@testing-library/react";

import Error404Page from "@/app/error/404/page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Error404Page", () => {
  it("should render the 404 error page with correct status code", async () => {
    await renderWithProviders(<Error404Page />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("404");
  });

  it("should render the description message", async () => {
    await renderWithProviders(<Error404Page />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
  });

  it("should not render a button since 404 errors don't have retry functionality", async () => {
    await renderWithProviders(<Error404Page />);

    const buttonElement = screen.queryByTestId("reload");
    expect(buttonElement).not.toBeInTheDocument();
  });
});
