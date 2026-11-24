import { render, screen } from "@testing-library/react";

import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FormattedMessage", () => {
  it("renders a formatted message", async () => {
    await renderWithProviders(
      <span data-testid="message">
        <FormattedMessage id="brand" />
      </span>,
    );
    expect(screen.getByTestId("message")).toHaveTextContent("Forseti");
  });
});
