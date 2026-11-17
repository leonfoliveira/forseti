import { render, screen } from "@testing-library/react";

import { Footer } from "@/app/_lib/component/layout/Footer";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/config/env", () => ({
  env: {
    version: "1.0.0",
  },
}));

describe("Footer", () => {
  it("shows the application version", async () => {
    await renderWithProviders(<Footer />);
    expect(screen.getByTestId("footer-text")).toHaveTextContent(
      "Forseti 1.0.0",
    );
  });
});
