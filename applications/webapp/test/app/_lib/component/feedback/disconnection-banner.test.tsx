import { screen } from "@testing-library/react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/disconnection-banner";
import { renderWithProviders } from "@/test/render-with-providers";

describe("DisconnectionBanner", () => {
  it("renders the disconnection message", async () => {
    await renderWithProviders(<DisconnectionBanner />);

    expect(screen.getByTestId("disconnection-banner")).toBeInTheDocument();
  });
});
