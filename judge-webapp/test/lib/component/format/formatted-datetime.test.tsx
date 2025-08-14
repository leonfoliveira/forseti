import { render } from "@testing-library/react";

import { FormattedDateTime } from "@/lib/component/format/formatted-datetime";
import { mockFormattedDate } from "@/test/jest.setup";

jest.unmock("@/lib/component/format/formatted-datetime");

describe("FormattedDateTime", () => {
  it("renders FormattedDate with correct value and default options", () => {
    const timestamp = "2023-10-27T10:00:00Z";
    render(<FormattedDateTime timestamp={timestamp} />);

    // Check that FormattedDate was called
    expect(mockFormattedDate).toHaveBeenCalledWith(
      {
        value: new Date(timestamp),
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
      undefined,
    );
  });

  it("renders FormattedDate with custom options overriding defaults", () => {
    const timestamp = "2023-10-27T10:00:00Z";
    const customOptions = {
      year: "numeric",
      month: "long",
    } as Intl.DateTimeFormatOptions;
    render(<FormattedDateTime timestamp={timestamp} options={customOptions} />);

    expect(mockFormattedDate).toHaveBeenCalledWith(
      {
        value: new Date(timestamp),
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
      undefined,
    );
  });
});
