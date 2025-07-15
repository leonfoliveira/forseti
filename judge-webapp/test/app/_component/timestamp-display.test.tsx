import { render } from "@testing-library/react";
import { TimestampDisplay } from "@/app/_component/timestamp-display";
import { useFormatter } from "next-intl";

describe("TimestampDisplay", () => {
  it("formats the timestamp correctly", () => {
    const now = "2025-01-01T12:00:00Z";
    render(<TimestampDisplay timestamp={now} />);
    const datetime = (useFormatter as jest.Mock).mock.results[0].value.dateTime;
    expect(datetime).toHaveBeenCalledWith(new Date(now), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });
});
