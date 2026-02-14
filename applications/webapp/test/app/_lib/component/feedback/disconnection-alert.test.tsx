import { screen } from "@testing-library/react";

import { DisconnectionAlert } from "@/app/_lib/component/feedback/disconnection-alert";
import { renderWithProviders } from "@/test/render-with-providers";

describe("DisconnectionAlert", () => {
  it("renders the disconnection message", async () => {
    await renderWithProviders(<DisconnectionAlert />);

    expect(screen.getByTestId("disconnection-alert")).toBeInTheDocument();
  });
});
