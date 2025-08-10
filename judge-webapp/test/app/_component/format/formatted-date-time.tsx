import { render } from "@testing-library/react";
import { FormattedDateTime } from "@/app/_component/format/formatted-datetime";

const mockDateTime = jest.fn((date, options) => {
  return `Formatted: ${date.toISOString()} ${JSON.stringify(options)}`;
});

describe("TimestampDisplay", () => {
  beforeEach(() => {
    mockDateTime.mockClear();
  });

  it("calls dateTime with the correct date and default options", () => {
    const timestamp = "2023-10-27T10:00:00Z";
    render(<FormattedDateTime timestamp={timestamp} />);
    expect(mockDateTime).toHaveBeenCalledWith(new Date(timestamp), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  it("calls dateTime with the correct date and custom options", () => {
    const timestamp = "2023-10-27T10:00:00Z";
    const customOptions = { year: "numeric", month: "long" } as any;
    render(<FormattedDateTime timestamp={timestamp} options={customOptions} />);
    expect(mockDateTime).toHaveBeenCalledWith(new Date(timestamp), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      ...customOptions,
    });
  });
});
