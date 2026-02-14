import { screen } from "@testing-library/dom";

import { FormattedDuration } from "@/app/_lib/component/i18n/formatted-duration";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FormattedDuration", () => {
  it("should format duration without days correctly", async () => {
    await renderWithProviders(<FormattedDuration ms={0} />);

    expect(screen.getByText("00:00:00")).toBeInTheDocument();
  });

  it("should format duration with days correctly", async () => {
    await renderWithProviders(<FormattedDuration ms={86400000} />);

    expect(screen.getByText("1d 00:00:00")).toBeInTheDocument();
  });
});
