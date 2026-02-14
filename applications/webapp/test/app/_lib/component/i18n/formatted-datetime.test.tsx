import { screen } from "@testing-library/dom";

import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { renderWithProviders } from "@/test/render-with-providers";

describe("FormattedDateTime", () => {
  it("should format date correctly", async () => {
    await renderWithProviders(
      <FormattedDateTime timestamp="2025-01-01T00:00:00Z" />,
    );

    expect(screen.getByText("01/01/2025, 12:00:00 AM")).toBeInTheDocument();
  });

  it("should format date with option override", async () => {
    await renderWithProviders(
      <FormattedDateTime
        timestamp="2025-01-01T00:00:00Z"
        options={{
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: undefined,
          minute: undefined,
          second: undefined,
        }}
      />,
    );

    expect(screen.getByText("January 1, 2025")).toBeInTheDocument();
  });
});
