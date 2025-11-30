import { screen } from "@testing-library/dom";

import { Footer } from "@/app/_lib/component/footer";
import { serverConfig } from "@/config/config";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Footer", () => {
  it("should render the footer with the correct content", async () => {
    await renderWithProviders(<Footer />);

    const anchor = screen.getByRole("link");
    expect(anchor).toHaveAttribute(
      "href",
      "https://github.com/leonfoliveira/forseti",
    );
    expect(anchor).toHaveTextContent(`Forseti ${serverConfig.version}`);
  });
});
