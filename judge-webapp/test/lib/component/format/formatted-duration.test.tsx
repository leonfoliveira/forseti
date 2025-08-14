import { render } from "@testing-library/react";
import { FormattedMessage } from "react-intl";

import { FormattedDuration } from "@/lib/component/format/formatted-duration";

describe("FormattedDuration", () => {
  it("renders duration correctly", () => {
    render(<FormattedDuration ms={1000 * 60 * 60 * 6} />);
    expect(FormattedMessage).toHaveBeenCalledWith(
      {
        id: "lib.component.format.formatted-duration.duration",
        defaultMessage: "{hours}:{minutes}:{seconds}",
        values: {
          days: "00",
          hours: "06",
          minutes: "00",
          seconds: "00",
        },
      },
      undefined,
    );
  });

  it("renders duration with days correctly", () => {
    render(<FormattedDuration ms={1000 * 60 * 60 * 24} />);
    expect(FormattedMessage).toHaveBeenCalledWith(
      {
        id: "lib.component.format.formatted-duration.duration-with-days",
        defaultMessage: "{days}d {hours}:{minutes}:{seconds}",
        values: {
          days: "01",
          hours: "00",
          minutes: "00",
          seconds: "00",
        },
      },
      undefined,
    );
  });
});
