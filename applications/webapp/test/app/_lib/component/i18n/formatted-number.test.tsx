import { screen } from "@testing-library/dom";

import { FormattedNumber } from "@/app/_lib/component/i18n/formatted-number";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FormattedNumber", () => {
  it("should format number correctly", async () => {
    await renderWithProviders(<FormattedNumber value={12345} />);

    expect(screen.getByText("12,345")).toBeInTheDocument();
  });

  it("should format number with option override", async () => {
    await renderWithProviders(
      <FormattedNumber
        value={12345}
        options={{ notation: "compact", compactDisplay: "short" }}
      />,
    );

    expect(screen.getByText("12K")).toBeInTheDocument();
  });
});
