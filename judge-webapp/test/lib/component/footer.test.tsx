import { screen } from "@testing-library/dom";

import { env } from "@/config/env";
import { Footer } from "@/lib/component/footer";
import { renderWithProviders } from "@/test/render-with-providers";

describe("Footer", () => {
  it("should render the footer with the correct content", async () => {
    await renderWithProviders(<Footer />);

    const anchor = screen.getByRole("link");
    expect(anchor).toHaveAttribute(
      "href",
      "https://github.com/leonfoliveira/judge",
    );
    expect(anchor).toHaveTextContent(`Judge ${env.VERSION}`);
  });
});
