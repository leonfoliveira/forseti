import { screen } from "@testing-library/dom";

import { WaitPage } from "@/app/[slug]/(dashboard)/_common/wait-page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("WaitPage", () => {
  it("should render call components correctly", async () => {
    await renderWithProviders(<WaitPage />);

    expect(screen.getByTestId("wait-page")).toBeInTheDocument();
  });
});
