import { screen } from "@testing-library/react";

import Error403Page from "@/app/error/403/page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Error403Page", () => {
  it("should render the 403 error page with correct status code", async () => {
    await renderWithProviders(<Error403Page />);

    const codeElement = screen.getByTestId("code");
    expect(codeElement).toBeInTheDocument();
    expect(codeElement).toHaveTextContent("403");
  });

  it("should render the description message", async () => {
    await renderWithProviders(<Error403Page />);

    const descriptionElement = screen.getByTestId("description");
    expect(descriptionElement).toBeInTheDocument();
  });

  it("should not render a button since 403 errors don't have retry functionality", async () => {
    await renderWithProviders(<Error403Page />);

    const buttonElement = screen.queryByTestId("reload");
    expect(buttonElement).not.toBeInTheDocument();
  });
});
