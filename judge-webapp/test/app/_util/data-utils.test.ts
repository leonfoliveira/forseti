import { DateUtils } from "@/app/_util/date-utils";

describe("DateUtils", () => {
  it("formats positive time difference correctly", () => {
    const result = DateUtils.formatDifference(90061000); // 1 day, 1 hour, 1 minute, 1 second
    expect(result).toBe("1d 01:01:01");
  });

  it("formats zero time difference as zero", () => {
    const result = DateUtils.formatDifference(0);
    expect(result).toBe("0d 00:00:00");
  });

  it("handles negative time difference as zero", () => {
    const result = DateUtils.formatDifference(-1000);
    expect(result).toBe("0d 00:00:00");
  });

  it("formats date to input format correctly", () => {
    const date = new Date("2023-01-01T12:34:00");
    const result = DateUtils.toDateInputFormat(date);
    expect(result).toBe("2023-01-01T12:34");
  });

  it("handles single digit month and day in date input format", () => {
    const date = new Date("2023-03-05T08:09:00");
    const result = DateUtils.toDateInputFormat(date);
    expect(result).toBe("2023-03-05T08:09");
  });

  it("handles midnight time in date input format", () => {
    const date = new Date("2023-12-31T00:00:00");
    const result = DateUtils.toDateInputFormat(date);
    expect(result).toBe("2023-12-31T00:00");
  });
});
