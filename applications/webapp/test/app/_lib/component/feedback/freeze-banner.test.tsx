import { screen } from "@testing-library/dom";

import { FreezeBanner } from "@/app/_lib/component/feedback/freeze-banner";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FreezeBanner", () => {
  it("renders the frozen indicator", async () => {
    await renderWithProviders(<FreezeBanner />);

    expect(screen.getByTestId("freeze-banner")).toBeInTheDocument();
  });
});
