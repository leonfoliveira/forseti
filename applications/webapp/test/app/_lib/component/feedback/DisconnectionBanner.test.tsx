import { screen } from "@testing-library/react";

import { DisconnectionBanner } from "@/app/_lib/component/feedback/DisconnectionBanner";
import { renderWithProviders } from "@/test/render-with-providers";

describe("DisconnectionBanner", () => {
  it("explains that live updates are unavailable", async () => {
    await renderWithProviders(<DisconnectionBanner />);
    expect(screen.getByTestId("disconnection-banner")).toHaveTextContent(
      "Connection to server lost. Live updates are unavailable. Attempting to reconnect...",
    );
  });
});
