import { screen } from "@testing-library/dom";

import { LoadingPage } from "@/app/_lib/component/page/loading-page";
import { renderWithProviders } from "@/test/render-with-providers";

describe("LoadingPage", () => {
  it("should render content correctly", async () => {
    await renderWithProviders(<LoadingPage />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });
});
