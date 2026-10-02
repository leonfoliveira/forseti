import { render, screen } from "@testing-library/react";

import { FormattedDateTime } from "@/app/_lib/component/i18n/FormattedDateTime";

describe("FormattedDateTime", () => {
  it("formats timestamps using the default and caller-supplied options", () => {
    render(<span data-testid="datetime"><FormattedDateTime
      timestamp="2026-02-09T22:58:05Z"
      options={{ hour: "2-digit", minute: "2-digit", second: undefined }}
    /></span>);
    expect(screen.getByTestId("datetime")).toHaveTextContent("02/09/2026");
  });
});
