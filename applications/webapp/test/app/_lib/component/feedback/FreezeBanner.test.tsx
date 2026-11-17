import { screen } from "@testing-library/react";

import { FreezeBanner } from "@/app/_lib/component/feedback/FreezeBanner";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FreezeBanner", () => {
  it("explains that the contest is frozen", async () => {
    await renderWithProviders(<FreezeBanner />);
    expect(screen.getByTestId("freeze-banner")).toHaveTextContent(
      "Contest frozen.",
    );
  });
});
