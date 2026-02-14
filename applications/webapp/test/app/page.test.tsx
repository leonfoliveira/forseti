import { screen } from "@testing-library/react";

import HomePage from "@/app/page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("HomePage", () => {
  it("renders the home page with correct content", async () => {
    await renderWithProviders(<HomePage />);

    const welcomeTitle = screen.getByTestId("welcome-title");
    expect(welcomeTitle).toBeInTheDocument();

    const contestAccessInfo = screen.getByTestId("contest-access-info");
    expect(contestAccessInfo).toBeInTheDocument();

    const urlFormat = screen.getByTestId("url-format");
    expect(urlFormat).toBeInTheDocument();
    expect(urlFormat).toHaveTextContent("/{contest-slug}");

    const urlFormatDescription = screen.getByTestId("url-format-description");
    expect(urlFormatDescription).toBeInTheDocument();

    const contactAdmin = screen.getByTestId("contact-admin");
    expect(contactAdmin).toBeInTheDocument();
  });
});
