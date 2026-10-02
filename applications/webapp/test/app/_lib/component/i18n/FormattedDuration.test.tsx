import { render, screen } from "@testing-library/react";

import { FormattedDuration } from "@/app/_lib/component/i18n/FormattedDuration";

describe("FormattedDuration", () => {
  it("formats days and clamps negative durations to zero", () => {
    render(<>
      <span data-testid="days"><FormattedDuration ms={90_061_000} /></span>
      <span data-testid="negative"><FormattedDuration ms={-1} /></span>
    </>);
    expect(screen.getByTestId("days")).toHaveTextContent("1d 01:01:01");
    expect(screen.getByTestId("negative")).toHaveTextContent("00:00:00");
  });
});
