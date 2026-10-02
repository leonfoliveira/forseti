import { render, screen } from "@testing-library/react";

import { FormattedNumber } from "@/app/_lib/component/i18n/FormattedNumber";

describe("FormattedNumber", () => {
  it("formats numbers and appends an optional suffix", () => {
    render(<span data-testid="number"><FormattedNumber
      value={1234.5}
      suffix=" pts"
      options={{ minimumFractionDigits: 1 }}
    /></span>);
    expect(screen.getByTestId("number")).toHaveTextContent("1,234.5 pts");
  });
});
