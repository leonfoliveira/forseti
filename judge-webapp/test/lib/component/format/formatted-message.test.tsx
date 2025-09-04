import { screen } from "@testing-library/dom";

import { FormattedMessage } from "@/lib/component/format/formatted-message";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FormattedMessage", () => {
  it("should render formatted message correctly", async () => {
    await renderWithProviders(
      <FormattedMessage id="app.page.page-title" defaultMessage="Judge" />,
    );

    expect(screen.getByText("Judge")).toBeInTheDocument();
  });
});
