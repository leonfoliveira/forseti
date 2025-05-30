import {
  formatDateTime,
  formatDifference,
  toLocaleString,
} from "@/app/_util/date-utils";

describe("formatDateTime", () => {
  it("formats a valid date string into 'YYYY-MM-DD HH:mm' format", () => {
    expect(formatDateTime("2023-10-01T15:30:00")).toBe("2023-10-01 15:30");
  });

  it("handles edge case of epoch time correctly", () => {
    expect(formatDateTime("1970-01-01T00:00:00")).toBe("1970-01-01 00:00");
  });
});

describe("formatDifference", () => {
  it("formats a difference of 0 milliseconds as '0d 00:00:00'", () => {
    expect(formatDifference(0)).toBe("0d 00:00:00");
  });

  it("formats a difference of 1 day, 1 hour, 1 minute, and 1 second correctly", () => {
    expect(formatDifference(90061000)).toBe("1d 01:01:01");
  });

  it("handles large differences spanning multiple days correctly", () => {
    expect(formatDifference(172800000)).toBe("2d 00:00:00");
  });

  it("handles negative differences by returning '0d 00:00:00'", () => {
    expect(formatDifference(-1000)).toBe("0d 00:00:00");
  });
});

describe("toLocaleString", () => {
  it("formats a valid date string into a localized string", () => {
    expect(toLocaleString("2023-10-01T15:30:00")).toBe(
      "10/01/2023, 03:30:00 PM",
    );
  });

  it("handles invalid date strings by returning 'Invalid Date'", () => {
    expect(toLocaleString("invalid-date")).toBe("Invalid Date");
  });

  it("handles edge case of epoch time correctly", () => {
    expect(toLocaleString("1970-01-01T00:00:00")).toBe(
      "01/01/1970, 12:00:00 AM",
    );
  });
});
