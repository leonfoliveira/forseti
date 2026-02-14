import { screen } from "@testing-library/dom";

import { Footer } from "@/app/_lib/component/layout/footer";
import { serverConfig } from "@/config/config";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Footer", () => {
  it("should render the footer with the correct content", async () => {
    await renderWithProviders(<Footer />);

    expect(screen.getByTestId("footer-text")).toHaveTextContent(
      `Forseti ${serverConfig.version}`,
    );
  });
});
